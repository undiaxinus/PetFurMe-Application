@echo off
echo Building with online connectivity...

rem Force correct JAVA_HOME path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

cd android
copy /Y gradle.properties gradle.properties.backup
copy /Y gradle.properties.tls gradle.properties

rem Add explicit TLS protocols for this session
set GRADLE_OPTS=-Dhttps.protocols=TLSv1.2,TLSv1.3 -Djdk.tls.client.protocols=TLSv1.2,TLSv1.3

rem Don't modify settings.gradle - keep original

rem Run with explicit configuration and TLS settings
echo Building with TLS security settings...
call gradlew.bat --refresh-dependencies clean
call gradlew.bat --refresh-dependencies assembleDebug -PreactNativeArchitectures=arm64-v8a

copy /Y gradle.properties.backup gradle.properties
echo Build completed!
pause 