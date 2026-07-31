terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {}

resource "random_id" "postgres_server_suffix" {
  byte_length = 3
}

resource "random_password" "postgres_admin_password" {
  length  = 24
  special = false
}

locals {
  name_prefix                             = "${var.project_name}-${var.environment}"
  computed_rg_name                        = "${local.name_prefix}-rg"
  final_rg_name                           = coalesce(var.resource_group_name, local.computed_rg_name)
  computed_managed_identity_name          = "${local.name_prefix}-uami"
  final_managed_identity_name             = coalesce(var.managed_identity_name, local.computed_managed_identity_name)
  computed_log_analytics_workspace_name   = "${local.name_prefix}-law"
  final_log_analytics_workspace_name      = coalesce(var.log_analytics_workspace_name, local.computed_log_analytics_workspace_name)
  computed_container_app_environment_name = "${local.name_prefix}-cae"
  final_container_app_environment_name    = coalesce(var.container_app_environment_name, local.computed_container_app_environment_name)
  computed_backend_container_app_name     = "${local.name_prefix}-backend"
  final_backend_container_app_name        = coalesce(var.backend_container_app_name, local.computed_backend_container_app_name)
  computed_frontend_container_app_name    = "${local.name_prefix}-frontend"
  final_frontend_container_app_name       = coalesce(var.frontend_container_app_name, local.computed_frontend_container_app_name)
  computed_postgres_server_name           = "${local.name_prefix}-psql-${random_id.postgres_server_suffix.hex}"
  final_postgres_server_name              = coalesce(var.postgres_server_name, local.computed_postgres_server_name)
  backend_image                           = "${var.acr_login_server}/${var.backend_image_name}:${var.backend_image_tag}"
  frontend_image                          = "${var.acr_login_server}/${var.frontend_image_name}:${var.frontend_image_tag}"
  database_url                            = format("postgresql://%s:%s@%s:5432/%s?sslmode=require", var.postgres_admin_username, random_password.postgres_admin_password.result, azurerm_postgresql_flexible_server.app.fqdn, azurerm_postgresql_flexible_server_database.app.name)
  environment_tags = merge(
    var.tags,
    {
      Environment = var.environment
      Project     = var.project_name
    }
  )
}

module "resource_group" {
  source = "./modules/resource-group"

  resource_group_name = local.final_rg_name
  location            = var.location
  environment         = var.environment
  tags                = local.environment_tags
}

resource "azurerm_postgresql_flexible_server" "app" {
  name                          = local.final_postgres_server_name
  resource_group_name           = module.resource_group.name
  location                      = var.location
  version                       = var.postgres_version
  administrator_login           = var.postgres_admin_username
  administrator_password        = random_password.postgres_admin_password.result
  storage_mb                    = var.postgres_storage_mb
  sku_name                      = var.postgres_sku_name
  backup_retention_days         = var.postgres_backup_retention_days
  public_network_access_enabled = var.postgres_public_network_access_enabled
  tags                          = local.environment_tags
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = var.postgres_database_name
  server_id = azurerm_postgresql_flexible_server.app.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  count = var.postgres_allow_azure_services ? 1 : 0

  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.app.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_key_vault_secret" "database_url" {
  name         = "database-url"
  value        = local.database_url
  key_vault_id = azurerm_key_vault.this.id
  content_type = "DATABASE_URL"

  depends_on = [
    azurerm_postgresql_flexible_server_database.app,
    azurerm_role_assignment.kv_deployer_secrets_officer,
  ]
}

//User Assigned Managed Identity step 2
resource "azurerm_user_assigned_identity" "app" {
  name                = local.final_managed_identity_name
  location            = var.location
  resource_group_name = module.resource_group.name
  tags                = local.environment_tags
}

resource "azurerm_log_analytics_workspace" "container_apps" {
  name                = local.final_log_analytics_workspace_name
  location            = var.location
  resource_group_name = module.resource_group.name
  sku                 = var.log_analytics_workspace_sku
  retention_in_days   = var.log_analytics_retention_days
  tags                = local.environment_tags
}

//Container App Environment step 3
resource "azurerm_container_app_environment" "platform" {
  name                       = local.final_container_app_environment_name
  location                   = var.location
  resource_group_name        = module.resource_group.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.container_apps.id
  tags                       = local.environment_tags
}

data "azurerm_container_registry" "this" {
  name                = split(".", var.acr_login_server)[0]
  resource_group_name = var.acr_resource_group_name
}

//Access to ACR and Key Vault (Role Assignments) step 4
resource "azurerm_role_assignment" "app_key_vault_secrets_user" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.app.principal_id

  depends_on = [
    azurerm_key_vault.this,
    azurerm_user_assigned_identity.app,
  ]
}

resource "azurerm_role_assignment" "app_acr_pull" {
  scope                = data.azurerm_container_registry.this.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.app.principal_id

  depends_on = [
    azurerm_user_assigned_identity.app,
  ]
}

//Container App step 5
resource "azurerm_container_app" "backend" {
  name                         = local.final_backend_container_app_name
  container_app_environment_id = azurerm_container_app_environment.platform.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  registry {
    server   = var.acr_login_server
    identity = azurerm_user_assigned_identity.app.id
  }

  dynamic "secret" {
    for_each = var.backend_key_vault_secrets
    content {
      name                = secret.value.name
      key_vault_secret_id = secret.value.key_vault_secret_id
      identity            = azurerm_user_assigned_identity.app.id
    }
  }

  ingress {
    external_enabled = false
    target_port      = var.backend_container_port
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = var.backend_min_replicas
    max_replicas = var.backend_max_replicas

    container {
      name   = "backend"
      image  = local.backend_image
      cpu    = var.backend_container_cpu
      memory = var.backend_container_memory

      dynamic "env" {
        for_each = var.backend_env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.backend_secret_env_vars
        content {
          name        = env.key
          secret_name = env.value
        }
      }

      env {
        name  = "CORS_ORIGIN"
        value = "https://${local.final_frontend_container_app_name}.${azurerm_container_app_environment.platform.default_domain}"
      }
    }
  }

  tags = local.environment_tags

  depends_on = [
    azurerm_container_app_environment.platform,
    azurerm_key_vault_secret.database_url,
    azurerm_role_assignment.app_key_vault_secrets_user,
    azurerm_role_assignment.app_acr_pull,
  ]
}

resource "azurerm_container_app" "frontend" {
  name                         = local.final_frontend_container_app_name
  container_app_environment_id = azurerm_container_app_environment.platform.id
  resource_group_name          = module.resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.app.id]
  }

  registry {
    server   = var.acr_login_server
    identity = azurerm_user_assigned_identity.app.id
  }

  ingress {
    external_enabled = true
    target_port      = var.frontend_container_port
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = var.frontend_min_replicas
    max_replicas = var.frontend_max_replicas

    container {
      name   = "frontend"
      image  = local.frontend_image
      cpu    = var.frontend_container_cpu
      memory = var.frontend_container_memory

      dynamic "env" {
        for_each = var.frontend_env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      env {
        name = "BACKEND_URL"
        # stable internal FQDN — revision-suffix-free, known before apply
        value = "https://${local.final_backend_container_app_name}.internal.${azurerm_container_app_environment.platform.default_domain}"
      }
    }
  }

  tags = local.environment_tags

  depends_on = [
    azurerm_container_app_environment.platform,
    azurerm_container_app.backend,
    azurerm_role_assignment.app_acr_pull,
  ]
}

