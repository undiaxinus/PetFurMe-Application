@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
cd android
call gradlew.bat clean
call gradlew.bat assembleDebug
pause
