@echo off
setlocal

echo ESC-POS Printer Manager Running!!

:retry
cd /d %~dp0

REM Redirect PHP output to NUL to suppress logs on console
data\php.exe -S localhost:8000 data.phar >NUL 2>&1


REM Check the error level (error code) of the last command
REM If php.exe crashes (returns a non-zero exit code), prompt the user to retry
if %errorlevel% neq 0 (
    echo PHP process exited with an error. Restarting...
    timeout /t 5 /nobreak > nul  REM Wait for 5 seconds before retrying
    goto retry  REM Jump back to the :retry label to restart the process
)

endlocal
