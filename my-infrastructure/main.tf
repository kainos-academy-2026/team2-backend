terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
  name_prefix         = "${var.project_name}-${var.environment}"
  computed_rg_name    = "${local.name_prefix}-rg"
  final_rg_name       = coalesce(var.resource_group_name, local.computed_rg_name)
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
