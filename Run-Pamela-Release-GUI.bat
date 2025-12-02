@echo off
title Pamela Inventory - Release GUI

REM Change to repo root
cd /d F:\wamp64\www\pam-inv-dev\pamela-inventory

REM Launch PowerShell GUI with policy bypass
powershell -ExecutionPolicy Bypass -File "tools\pamela-release-gui.ps1"
