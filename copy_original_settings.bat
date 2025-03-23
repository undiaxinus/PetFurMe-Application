@echo off
echo Taking a simpler approach...

rem Force correct JAVA_HOME path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

rem Navigate to project
cd android

rem We already have a good gradle.properties - no need to modify it

rem Delete Gradle caches to be safe
echo Deleting Gradle caches...
rmdir /S /Q %USERPROFILE%\.gradle\caches\transforms-3

rem Run with explicit configuration and no daemon
echo Building with clean configuration...
call gradlew.bat --no-build-cache --no-daemon clean
call gradlew.bat --no-build-cache --no-daemon assembleDebug -PreactNativeArchitectures=arm64-v8a

echo Build completed!
pause 