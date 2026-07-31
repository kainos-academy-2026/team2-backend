backend_key_vault_secrets = [
  {
    name                = "database-url"
    key_vault_secret_id = "https://team2-backend-dev-kv.vault.azure.net/secrets/database-url"
  },
  {
    name                = "jwt-secret-key"
    key_vault_secret_id = "https://team2-backend-dev-kv.vault.azure.net/secrets/JWT-SECRET-KEY"
  },
  {
    name                = "cv-s3-bucket"
    key_vault_secret_id = "https://team2-backend-dev-kv.vault.azure.net/secrets/CV-S3-BUCKET"
  },
  {
    name                = "aws-region"
    key_vault_secret_id = "https://team2-backend-dev-kv.vault.azure.net/secrets/AWS-REGION"
  },
  {
    name                = "aws-access-key-id"
    key_vault_secret_id = "https://team2-backend-dev-kv.vault.azure.net/secrets/AWS-ACCESS-KEY-ID"
  },
  {
    name                = "aws-secret-access-key"
    key_vault_secret_id = "https://team2-backend-dev-kv.vault.azure.net/secrets/AWS-SECRET-ACCESS-KEY"
  }
]

backend_secret_env_vars = {
  DATABASE_URL          = "database-url"
  JWT_SECRET_KEY        = "jwt-secret-key"
  CV_S3_BUCKET          = "cv-s3-bucket"
  AWS_REGION            = "aws-region"
  AWS_ACCESS_KEY_ID     = "aws-access-key-id"
  AWS_SECRET_ACCESS_KEY = "aws-secret-access-key"
}
