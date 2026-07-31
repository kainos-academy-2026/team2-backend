variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.resource_group_name == null || (try(length(var.resource_group_name), 0) >= 1 && try(length(var.resource_group_name), 0) <= 90)
    error_message = "Resource group name must be between 1 and 90 characters."
  }
}

variable "location" {
  description = "Azure region where resources will be deployed"
  type        = string
  default     = "UK South"

  validation {
    condition     = length(var.location) > 0
    error_message = "Location must not be empty."
  }
}

variable "environment" {
  description = "Environment name (dev, test, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, prod."
  }
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "team2-backend"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must only contain lowercase letters, numbers, and hyphens."
  }
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    ManagedBy = "Terraform"
  }
}

variable "managed_identity_name" {
  description = "Optional explicit name for the User Assigned Managed Identity. If null, a name is computed."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.managed_identity_name == null || can(regex("^[a-zA-Z0-9-_.]{3,128}$", var.managed_identity_name))
    error_message = "Managed identity name must be 3-128 chars and use letters, numbers, dash, underscore, or dot."
  }
}

variable "log_analytics_workspace_name" {
  description = "Optional explicit name for the Log Analytics workspace used by Container Apps. If null, a name is computed."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.log_analytics_workspace_name == null || can(regex("^[a-zA-Z0-9-]{4,63}$", var.log_analytics_workspace_name))
    error_message = "Log Analytics workspace name must be 4-63 chars and use letters, numbers, or hyphens."
  }
}

variable "log_analytics_workspace_sku" {
  description = "SKU for Log Analytics workspace."
  type        = string
  default     = "PerGB2018"

  validation {
    condition     = contains(["PerGB2018", "Free", "Standalone", "CapacityReservation", "PerNode", "Premium"], var.log_analytics_workspace_sku)
    error_message = "Invalid Log Analytics workspace SKU."
  }
}

variable "log_analytics_retention_days" {
  description = "Retention period for Log Analytics data in days."
  type        = number
  default     = 30

  validation {
    condition     = var.log_analytics_retention_days >= 30 && var.log_analytics_retention_days <= 730
    error_message = "Log Analytics retention must be between 30 and 730 days."
  }
}

variable "container_app_environment_name" {
  description = "Optional explicit name for the Container App Environment. If null, a name is computed."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.container_app_environment_name == null || can(regex("^[a-zA-Z0-9-]{2,60}$", var.container_app_environment_name))
    error_message = "Container App Environment name must be 2-60 chars and use letters, numbers, or hyphens."
  }
}

variable "acr_resource_group_name" {
  description = "Resource group name of the Azure Container Registry."
  type        = string
  default     = "rg-ai-academy-26"
}

variable "acr_login_server" {
  description = "ACR login server used in container image references (for example: example.azurecr.io)."
  type        = string
  default     = "acraiacademy26.azurecr.io"

  validation {
    condition     = can(regex("^[a-zA-Z0-9.-]+$", var.acr_login_server))
    error_message = "acr_login_server must be a valid hostname."
  }
}

variable "backend_container_app_name" {
  description = "Optional explicit backend Container App name. If null, a name is computed."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.backend_container_app_name == null || can(regex("^[a-z0-9-]{2,32}$", var.backend_container_app_name))
    error_message = "backend_container_app_name must be 2-32 chars using lowercase letters, numbers, and hyphens."
  }
}

variable "frontend_container_app_name" {
  description = "Optional explicit frontend Container App name. If null, a name is computed."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.frontend_container_app_name == null || can(regex("^[a-z0-9-]{2,32}$", var.frontend_container_app_name))
    error_message = "frontend_container_app_name must be 2-32 chars using lowercase letters, numbers, and hyphens."
  }
}

variable "backend_image_name" {
  description = "Repository/image name for the backend container image."
  type        = string
  default     = "team2-backend"
}

variable "backend_image_tag" {
  description = "Image tag for the backend container image."
  type        = string
  default     = "latest"
}

variable "frontend_image_name" {
  description = "Repository/image name for the frontend container image."
  type        = string
  default     = "team2-frontend"
}

variable "frontend_image_tag" {
  description = "Image tag for the frontend container image."
  type        = string
  default     = "latest"
}

variable "backend_container_port" {
  description = "Port exposed by the backend container."
  type        = number
  default     = 3001
}

variable "frontend_container_port" {
  description = "Port exposed by the frontend container."
  type        = number
  default     = 3000
}

variable "backend_container_cpu" {
  description = "CPU allocation for the backend container."
  type        = number
  default     = 0.5
}

variable "frontend_container_cpu" {
  description = "CPU allocation for the frontend container."
  type        = number
  default     = 0.5
}

variable "backend_container_memory" {
  description = "Memory allocation for the backend container."
  type        = string
  default     = "1Gi"
}

variable "frontend_container_memory" {
  description = "Memory allocation for the frontend container."
  type        = string
  default     = "1Gi"
}

variable "backend_min_replicas" {
  description = "Minimum number of backend replicas."
  type        = number
  default     = 1
}

variable "frontend_min_replicas" {
  description = "Minimum number of frontend replicas."
  type        = number
  default     = 1
}

variable "backend_max_replicas" {
  description = "Maximum number of backend replicas."
  type        = number
  default     = 2
}

variable "frontend_max_replicas" {
  description = "Maximum number of frontend replicas."
  type        = number
  default     = 2
}

variable "backend_env_vars" {
  description = "Plain-text backend environment variables (name => value)."
  type        = map(string)
  default     = {}
}

variable "frontend_env_vars" {
  description = "Plain-text frontend environment variables (name => value)."
  type        = map(string)
  default     = {}
}

variable "backend_secret_env_vars" {
  description = "Backend secret environment variables (ENV_NAME => container app secret name)."
  type        = map(string)
  default     = {}
}

//Azure key vault step 1
variable "backend_key_vault_secrets" {
  description = "Backend Key Vault secrets to expose in Container App secret blocks."
  type = list(object({
    name                = string
    key_vault_secret_id = string
  }))
  default = []
}

variable "postgres_server_name" {
  description = "Optional explicit Azure Database for PostgreSQL Flexible Server name. If null, a unique name is computed."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.postgres_server_name == null || can(regex("^[a-z0-9-]{3,63}$", var.postgres_server_name))
    error_message = "postgres_server_name must be 3-63 chars using lowercase letters, numbers, and hyphens."
  }
}

variable "postgres_database_name" {
  description = "Application database name created on the PostgreSQL server."
  type        = string
  default     = "jobs_db"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]{0,62}$", var.postgres_database_name))
    error_message = "postgres_database_name must start with a letter and contain only letters, numbers, or underscores (max 63 chars)."
  }
}

variable "postgres_admin_username" {
  description = "Administrator username for Azure PostgreSQL Flexible Server."
  type        = string
  default     = "team2admin"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]{2,62}$", var.postgres_admin_username))
    error_message = "postgres_admin_username must start with a letter and be 3-63 chars using letters, numbers, or underscores."
  }
}

variable "postgres_version" {
  description = "PostgreSQL major version for Azure PostgreSQL Flexible Server."
  type        = string
  default     = "15"

  validation {
    condition     = contains(["13", "14", "15", "16"], var.postgres_version)
    error_message = "postgres_version must be one of: 13, 14, 15, 16."
  }
}

variable "postgres_sku_name" {
  description = "SKU for Azure PostgreSQL Flexible Server."
  type        = string
  default     = "B_Standard_B1ms"

  validation {
    condition     = length(var.postgres_sku_name) > 0
    error_message = "postgres_sku_name must not be empty."
  }
}

variable "postgres_storage_mb" {
  description = "Storage size in MB for Azure PostgreSQL Flexible Server."
  type        = number
  default     = 32768

  validation {
    condition     = var.postgres_storage_mb >= 32768
    error_message = "postgres_storage_mb must be at least 32768."
  }
}

variable "postgres_backup_retention_days" {
  description = "Backup retention period in days for Azure PostgreSQL Flexible Server."
  type        = number
  default     = 7

  validation {
    condition     = var.postgres_backup_retention_days >= 7 && var.postgres_backup_retention_days <= 35
    error_message = "postgres_backup_retention_days must be between 7 and 35."
  }
}

variable "postgres_public_network_access_enabled" {
  description = "Enable public network access for Azure PostgreSQL Flexible Server."
  type        = bool
  default     = true
}

variable "postgres_allow_azure_services" {
  description = "Allow Azure services access to the PostgreSQL server firewall using 0.0.0.0."
  type        = bool
  default     = true
}

variable "acr_name" {
  description = "Name of the existing Azure Container Registry"
  type        = string
  default     = "acraiacademy26"
}