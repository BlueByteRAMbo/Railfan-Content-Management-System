@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.
@echo off
set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

set DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties") DO (
    IF "%%A"=="wrapperUrl" SET DOWNLOAD_URL=%%B
)

@IF EXIST %WRAPPER_JAR% (
    java -cp %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*
) ELSE (
    echo Downloading Maven Wrapper...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('%DOWNLOAD_URL%','%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar')}"
    java -cp %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*
)
