@echo off
echo Building in OFFLINE mode...

rem Force correct JAVA_HOME path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

cd android
copy /Y gradle.properties gradle.properties.backup
copy /Y gradle.properties.tls gradle.properties

rem Run in offline mode (using cached dependencies)
echo Building with cached dependencies...
call gradlew.bat --offline clean
call gradlew.bat --offline assembleDebug -PreactNativeArchitectures=arm64-v8a

copy /Y gradle.properties.backup gradle.properties
echo Build completed!
pause 