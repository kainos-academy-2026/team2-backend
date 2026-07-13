process.env.DATABASE_URL ??=
	"postgresql://jobs_user:jobs_password@localhost:5432/jobs_db";
process.env.CORS_ORIGIN ??= "http://localhost:3001";
process.env.JWT_SECRET_KEY ??= "test-secret-key";
