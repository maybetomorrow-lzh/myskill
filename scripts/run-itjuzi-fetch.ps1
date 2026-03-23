param(
  [int]$Limit = 20
)
$env:Path = 'E:\code\myskill\tools\node-v22.18.0-win-x64;' + $env:Path
& 'E:\code\myskill\tools\node-v22.18.0-win-x64\node.exe' '.\scripts\itjuzi-fetch.js' '--limit' $Limit
