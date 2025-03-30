Write-Host "Building with explicit Java path..."

$JavaPath = "C:\Program Files\Android\Android Studio\jbr\bin\java.exe"
Write-Host "Using Java at: $JavaPath"

# Verify Java exists
if (-not (Test-Path $JavaPath)) {
    Write-Error "Java executable not found at specified path!"
    exit 1
}

# Navigate to the Android directory
Set-Location -Path .\android

# Make a backup of original properties
Copy-Item -Path gradle.properties -Destination gradle.properties.backup -Force
Copy-Item -Path gradle.properties.arm64 -Destination gradle.properties -Force

# Run Gradle with explicit Java executable
& $JavaPath "-Dorg.gradle.appname=gradlew" -classpath "gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain clean
& $JavaPath "-Dorg.gradle.appname=gradlew" -classpath "gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain assembleDebug "-PreactNativeArchitectures=arm64-v8a"

# Restore original properties
Copy-Item -Path gradle.properties.backup -Destination gradle.properties -Force

Write-Host "Build completed!" 