resource "azurerm_key_vault" "this" {
  name                       = "${local.name_prefix}-kv"
  location                   = module.resource_group.location
  resource_group_name        = module.resource_group.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  rbac_authorization_enabled = true

  tags = local.environment_tags
}

# Grant the identity running Terraform 'Key Vault Secrets Officer' so secrets
# can be created, read, and deleted via the Azure Portal.
resource "azurerm_role_assignment" "kv_deployer_secrets_officer" {
  scope                = azurerm_key_vault.this.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}
