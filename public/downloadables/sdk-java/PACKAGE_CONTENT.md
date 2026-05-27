# CroissantAPI Java Client Files

This package contains all the necessary files to use the Croissant API in Java.

## Main files

### 📁 Source code

- **CroissantAPI.java** - Main API client class (7KB)
- **CroissantAPIExample.java** - Complete usage examples (4KB)
- **CroissantAPITest.java** - Unit tests (6KB)

### 📁 Documentation

- **README_CroissantAPI_Java.md** - Complete documentation (8KB)
- **croissant-api-java.json** - Project metadata (1KB)

### 📁 Build configuration

- **pom.xml** - Maven configuration (2KB)
- **build.gradle** - Gradle configuration (1KB)

### 📁 Build scripts

- **build.sh** - Unix/Linux/macOS build script (2KB)
- **build.bat** - Windows build script (2KB)

### 📁 Development tools

- **.gitignore** - Git exclusion file (1KB)

## Quick installation

### Option 1: Maven

```bash
# Copy pom.xml to your project
mvn clean compile
mvn exec:java -Dexec.mainClass="CroissantAPIExample"
```

### Option 2: Gradle

```bash
# Copy build.gradle to your project
./gradlew build
./gradlew runExample
```

### Option 3: Manual compilation

```bash
# Unix/Linux/macOS
chmod +x build.sh
./build.sh run

# Windows
build.bat run
```

## Basic usage

```java
// Initialization
CroissantAPI api = new CroissantAPI("your_token");

// Get current user
User me = api.users.getMe();

// List games
List<Game> games = api.games.list();

// Buy an item
Map<String, Object> result = api.items.buy("item_id", 1);
```

## Supported features

✅ User management (authentication, search, transfers)
✅ Game management (list, search, purchase)
✅ Item management (creation, purchase, sale, gift)
✅ Inventory system
✅ Trading system between users
✅ Multiplayer lobby management
✅ Development studio management
✅ OAuth2 for external authentication
✅ Global search

## Dependencies

- **Java 8+** (required)
- **Gson 2.10.1** (included in Maven/Gradle configurations)
- **JUnit 4.13.2** (for tests only)

## Support

- 🌐 Official API: https://croissant-api.eminium.ovh/api
- 📖 TypeScript documentation: croissant-api.ts
- 🔧 Examples: CroissantAPIExample.java
- 🧪 Tests: CroissantAPITest.java

All files are compatible with Java 8+ and follow Java standard coding conventions.
