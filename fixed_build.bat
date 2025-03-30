@echo off
echo Starting FIXED BUILD - addressing TLS issues and preserving React Native config...

rem Force correct JAVA_HOME path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo Using JAVA_HOME: %JAVA_HOME%

rem Set TLS protocols explicitly for JVM
set GRADLE_OPTS=-Dhttps.protocols=TLSv1.2,TLSv1.3 -Djdk.tls.client.protocols=TLSv1.2,TLSv1.3 -Djsse.enableSNIExtension=false

cd android

rem Back up original files
echo Creating backups...
mkdir backups 2>nul
copy /Y gradle.properties backups\gradle.properties

rem Stop any running daemons
call gradlew.bat --stop

rem Create TLS-fixed gradle.properties that disables toolchains
echo # Fixed Gradle Properties > gradle.properties
echo org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -Dhttps.protocols=TLSv1.2,TLSv1.3 -Djdk.tls.client.protocols=TLSv1.3,TLSv1.2 -Djsse.enableSNIExtension=false >> gradle.properties
echo android.useAndroidX=true >> gradle.properties
echo reactNativeArchitectures=arm64-v8a >> gradle.properties
echo newArchEnabled=true >> gradle.properties
echo hermesEnabled=true >> gradle.properties
echo android.defaults.buildfeatures.buildconfig=true >> gradle.properties
echo # Completely disable all Java toolchain features >> gradle.properties
echo org.gradle.java.installations.auto-download=false >> gradle.properties
echo org.gradle.java.installations.auto-detect=false >> gradle.properties
echo org.gradle.java.installations.paths= >> gradle.properties
echo org.gradle.toolchains.foojay-resolver.ignore=true >> gradle.properties

rem Run offline first to use cached dependencies if available
echo Building with TLS fixes...
call gradlew.bat --offline clean
call gradlew.bat --offline assembleDebug -PreactNativeArchitectures=arm64-v8a

rem If offline build fails, try with online connection but strict TLS settings
if errorlevel 1 (
    echo Offline build failed, trying online build with TLS settings...
    call gradlew.bat --stacktrace --info clean
    call gradlew.bat --stacktrace --info assembleDebug -PreactNativeArchitectures=arm64-v8a
)

rem Restore original files
copy /Y backups\gradle.properties gradle.properties

echo Build completed!
pause 