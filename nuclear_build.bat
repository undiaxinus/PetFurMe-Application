@echo off
echo Starting NUCLEAR BUILD OPTION - clearing everything...

rem Force correct JAVA_HOME path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

rem Navigate to project
cd android

rem Back up original files
copy /Y gradle.properties gradle.properties.backup
copy /Y settings.gradle settings.gradle.backup

rem Delete Gradle caches
echo Deleting Gradle caches...
rmdir /S /Q %USERPROFILE%\.gradle\caches\transforms-3
rmdir /S /Q %USERPROFILE%\.gradle\caches\modules-2\files-2.1

rem Apply our non-toolchain configs
copy /Y gradle.properties.notoolchain gradle.properties
copy /Y settings.gradle.notools settings.gradle

rem Run with explicit configuration and no daemon
echo Building with clean configuration...
call gradlew.bat --no-daemon clean
call gradlew.bat --no-daemon assembleDebug -PreactNativeArchitectures=arm64-v8a

rem Restore original files
copy /Y gradle.properties.backup gradle.properties
copy /Y settings.gradle.backup settings.gradle

echo Build completed!
pause 