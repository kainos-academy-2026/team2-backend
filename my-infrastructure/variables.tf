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

variable "acr_resource_id" {
  description = "Resource ID of the Azure Container Registry to grant AcrPull to. If null, AcrPull role assignment is skipped."
  type        = string
  default     = null
  nullable    = true

  validation {
    condition     = var.acr_resource_id == null || can(regex("^/subscriptions/.+/resourceGroups/.+/providers/Microsoft.ContainerRegistry/registries/.+$", var.acr_resource_id))
    error_message = "acr_resource_id must be a valid Azure Container Registry resource ID."
  }
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

variable "backend_container_port" {
  description = "Port exposed by the backend container."
  type        = number
  default     = 3001
}

variable "backend_container_cpu" {
  description = "CPU allocation for the backend container."
  type        = number
  default     = 0.5
}

variable "backend_container_memory" {
  description = "Memory allocation for the backend container."
  type        = string
  default     = "1Gi"
}

variable "backend_min_replicas" {
  description = "Minimum number of backend replicas."
  type        = number
  default     = 1
}

variable "backend_max_replicas" {
  description = "Maximum number of backend replicas."
  type        = number
  default     = 2
}

variable "backend_env_vars" {
  description = "Plain-text backend environment variables (name => value)."
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