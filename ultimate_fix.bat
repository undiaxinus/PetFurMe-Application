@echo off
echo ===================================
echo ULTIMATE JAVA TOOLCHAIN CONFLICT FIX
echo ===================================

rem Force correct JAVA_HOME path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

cd android

rem Back up original files
echo Creating backups...
mkdir backups 2>nul
copy /Y gradle.properties backups\gradle.properties.bak
copy /Y app\build.gradle backups\app_build.gradle.bak

rem Kill any running Gradle daemons
echo Stopping all Gradle daemons...
call gradlew.bat --stop

rem Modify app/build.gradle to fix Java compatibility settings
echo Fixing Java compatibility in app/build.gradle...
powershell -Command "$content = Get-Content -Path 'app\build.gradle' -Raw; $fixed = $content -replace 'compileOptions \{[^\}]*\}', 'compileOptions {\n        // Set Java compatibility through release option only\n        // Do not use source/target compatibility with toolchains\n    }'; $fixed = $fixed -replace 'options\.release\.set\(11\)', '// Removed toolchain conflict'; Set-Content -Path 'app\build.gradle' -Value $fixed;"

rem Create proper gradle.properties that avoids toolchain conflict
echo Writing fixed gradle.properties...
echo # Fixed gradle.properties > gradle.properties
echo org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m >> gradle.properties
echo android.useAndroidX=true >> gradle.properties
echo reactNativeArchitectures=arm64-v8a >> gradle.properties
echo newArchEnabled=true >> gradle.properties
echo hermesEnabled=true >> gradle.properties
echo android.defaults.buildfeatures.buildconfig=true >> gradle.properties
echo # Disable Java toolchain features >> gradle.properties
echo org.gradle.java.installations.auto-download=false >> gradle.properties
echo org.gradle.java.installations.auto-detect=false >> gradle.properties
echo org.gradle.toolchains.foojay-resolver.ignore=true >> gradle.properties

echo Running clean build...
call gradlew.bat clean
call gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a

echo Restoring original files...
copy /Y backups\gradle.properties.bak gradle.properties
copy /Y backups\app_build.gradle.bak app\build.gradle

echo Build completed!
pause 