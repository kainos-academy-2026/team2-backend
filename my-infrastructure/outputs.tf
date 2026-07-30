output "resource_group_name" {
  description = "Name of the Azure resource group"
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "The ID of the created resource group"
  value       = module.resource_group.id
}

output "location" {
  description = "The location of the resource group"
  value       = module.resource_group.location
}

output "key_vault_id" {
  description = "Key Vault resource ID"
  value       = azurerm_key_vault.this.id
}

output "key_vault_name" {
  description = "Key Vault name"
  value       = azurerm_key_vault.this.name
}

output "key_vault_uri" {
  description = "Key Vault URI"
  value       = azurerm_key_vault.this.vault_uri
}

output "managed_identity_id" {
  description = "Resource ID of the managed identity"
  value       = azurerm_user_assigned_identity.app.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the managed identity (used for RBAC role assignments)"
  value       = azurerm_user_assigned_identity.app.principal_id
}

output "managed_identity_client_id" {
  description = "Client ID of the managed identity (used by service integrations)"
  value       = azurerm_user_assigned_identity.app.client_id
}

output "log_analytics_workspace_id" {
  description = "Resource ID of the Log Analytics workspace used by Container Apps"
  value       = azurerm_log_analytics_workspace.container_apps.id
}

output "container_app_environment_id" {
  description = "Resource ID of the Container App Environment"
  value       = azurerm_container_app_environment.platform.id
}

output "container_app_environment_name" {
  description = "Name of the Container App Environment"
  value       = azurerm_container_app_environment.platform.name
}

output "container_app_environment_default_domain" {
  description = "Default domain for the Container App Environment"
  value       = azurerm_container_app_environment.platform.default_domain
}

output "key_vault_secrets_user_role_assignment_id" {
  description = "Role assignment ID for Key Vault Secrets User on the managed identity"
  value       = azurerm_role_assignment.app_key_vault_secrets_user.id
}

output "acr_pull_role_assignment_id" {
  description = "Role assignment ID for AcrPull on the managed identity (null when acr_resource_id is not provided)"
  value       = try(one(azurerm_role_assignment.app_acr_pull[*].id), null)
}

output "backend_container_app_name" {
  description = "Backend Container App name"
  value       = azurerm_container_app.backend.name
}

output "backend_container_app_internal_fqdn" {
  description = "Internal FQDN for the backend Container App"
  value       = azurerm_container_app.backend.latest_revision_fqdn
}