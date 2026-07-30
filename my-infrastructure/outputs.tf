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

output "key_vault_name" {
  description = "The name of the Key Vault"
  value       = azurerm_key_vault.this.name
}

output "key_vault_uri" {
  description = "The URI of the Key Vault (used to reference secrets)"
  value       = azurerm_key_vault.this.vault_uri
}