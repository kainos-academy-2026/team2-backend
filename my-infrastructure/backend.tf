# backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "tfstate1785248282" # Replace with your storage account name
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}