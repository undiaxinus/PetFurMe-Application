@echo off
echo Cleaning environment...
set JAVA_HOME=
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

cd android
call gradlew.bat clean
call gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a
echo Build completed!
pause 