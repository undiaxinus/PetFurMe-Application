@echo off
echo Building with minimal configuration...

rem Force correct JAVA_HOME path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

cd android
copy /Y gradle.properties gradle.properties.backup
copy /Y gradle.properties.notoolchain gradle.properties

rem Clear Gradle caches
rmdir /S /Q %USERPROFILE%\.gradle\caches\transforms-3
 
rem Run with explicit configuration
call gradlew.bat --no-daemon clean assembleDebug -PreactNativeArchitectures=arm64-v8a

copy /Y gradle.properties.backup gradle.properties
echo Build completed!
pause 