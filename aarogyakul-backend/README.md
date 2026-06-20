# AarogyaKul - Backend
cd aarogyakul-backend

# Run with environment variables
export $(cat .env | xargs) && mvn spring-boot:run

# Or run with Maven
mvn spring-boot:run

# Test
mvn test

# Build JAR
mvn clean package

# Build Docker image
docker build -t aarogyakul/backend .
