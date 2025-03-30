@echo off
echo Building for arm64-v8a...

rem Force correct JAVA_HOME path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

cd android
copy /Y gradle.properties gradle.properties.backup
copy /Y gradle.properties.arm64 gradle.properties
call gradlew.bat clean
call gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a
copy /Y gradle.properties.backup gradle.properties
echo Build completed!
pause 