#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Android APK build process...${NC}"

# Check if keystore exists
if [ ! -f "app/release.keystore" ]; then
    echo -e "${YELLOW}Keystore not found. Generating new keystore...${NC}"
    
    # Generate keystore
    keytool -genkeypair \
        -v \
        -keystore app/release.keystore \
        -alias wine \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass wine123 \
        -keypass wine123 \
        -dname "CN=Wine,OU=Development,O=Wine,L=Unknown,S=Unknown,C=US"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Keystore generated successfully${NC}"
    else
        echo -e "${RED}Failed to generate keystore${NC}"
        exit 1
    fi
fi

# Update build.gradle with release signing config
if ! grep -q "release {" app/build.gradle; then
    echo -e "${YELLOW}Updating build.gradle with release signing config...${NC}"
    sed -i '' '/signingConfigs {/a\
        release {\
            storeFile file("release.keystore")\
            storePassword "wine123"\
            keyAlias "wine"\
            keyPassword "wine123"\
        }
    ' app/build.gradle
    
    # Update release buildType to use release signing config
    sed -i '' 's/signingConfig signingConfigs.debug/signingConfig signingConfigs.release/' app/build.gradle
fi

# Clean project
echo -e "${YELLOW}Cleaning project...${NC}"
./gradlew clean

# Build release APK
echo -e "${YELLOW}Building release APK...${NC}"
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo -e "${GREEN}APK built successfully!${NC}"
    echo -e "${GREEN}APK location: app/build/outputs/apk/release/app-release.apk${NC}"
else
    echo -e "${RED}Failed to build APK${NC}"
    exit 1
fi
