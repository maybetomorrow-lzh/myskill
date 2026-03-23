param(
    [Parameter(Mandatory = $true)]
    [string]$MarkdownPath,

    [string]$ConfigPath = ".feishu-publisher.json",

    [string]$Title,

    [string]$FolderToken,

    [string]$ExistingDocumentId
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-JsonFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { throw "Config file not found: $Path" }
    return Get-Content $Path -Raw | ConvertFrom-Json
}

function Invoke-FeishuApi {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers,
        [object]$Body = $null
    )

    $params = @{ Method = $Method; Uri = $Uri; Headers = $Headers }
    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 30 -Compress)
        $params.ContentType = "application/json; charset=utf-8"
    }

    $response = Invoke-RestMethod @params
    if ($response.code -ne 0) {
        throw "Feishu API failed: $($response.msg) (code=$($response.code))"
    }
    return $response
}

function Get-TenantAccessToken {
    param([string]$AppId, [string]$AppSecret)
    $body = @{ app_id = $AppId; app_secret = $AppSecret }
    $response = Invoke-FeishuApi -Method "POST" -Uri "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" -Headers @{} -Body $body
    return $response.tenant_access_token
}

function New-FeishuDocument {
    param([string]$AccessToken, [string]$DocTitle, [string]$DocFolderToken)
    $body = @{ title = $DocTitle }
    if (-not [string]::IsNullOrWhiteSpace($DocFolderToken)) { $body.folder_token = $DocFolderToken }
    $response = Invoke-FeishuApi -Method "POST" -Uri "https://open.feishu.cn/open-apis/docx/v1/documents" -Headers @{ Authorization = "Bearer $AccessToken" } -Body $body
    return $response.data.document.document_id
}

function Get-DocumentChildrenCount {
    param([string]$AccessToken, [string]$DocumentId)
    $response = Invoke-FeishuApi -Method "GET" -Uri "https://open.feishu.cn/open-apis/docx/v1/documents/$DocumentId/blocks" -Headers @{ Authorization = "Bearer $AccessToken" }
    $root = $response.data.items | Where-Object { $_.block_id -eq $DocumentId } | Select-Object -First 1
    if ($null -eq $root -or $null -eq $root.children) { return 0 }
    return @($root.children).Count
}

function Clear-DocumentContents {
    param([string]$AccessToken, [string]$DocumentId)
    $count = Get-DocumentChildrenCount -AccessToken $AccessToken -DocumentId $DocumentId
    if ($count -le 0) { return }

    $clientToken = [guid]::NewGuid().ToString()
    $uri = "https://open.feishu.cn/open-apis/docx/v1/documents/$DocumentId/blocks/$DocumentId/children/batch_delete?client_token=$clientToken"
    $body = @{ start_index = 0; end_index = $count - 1 }
    Invoke-FeishuApi -Method "DELETE" -Uri $uri -Headers @{ Authorization = "Bearer $AccessToken" } -Body $body | Out-Null
    Start-Sleep -Milliseconds 500
}

function New-TextElements {
    param([string]$Content)
    return ,@(@{ text_run = @{ content = $Content } })
}

function New-TextBlock {
    param([int]$BlockType, [string]$PropertyName, [string]$Content)
    return @{ block_type = $BlockType; $PropertyName = @{ elements = (New-TextElements -Content $Content); style = @{} } }
}

function New-ParagraphBlock { param([string]$Content) New-TextBlock -BlockType 2 -PropertyName "text" -Content $Content }
function New-Heading1Block { param([string]$Content) New-TextBlock -BlockType 3 -PropertyName "heading1" -Content $Content }
function New-Heading2Block { param([string]$Content) New-TextBlock -BlockType 4 -PropertyName "heading2" -Content $Content }
function New-Heading3Block { param([string]$Content) New-TextBlock -BlockType 5 -PropertyName "heading3" -Content $Content }
function New-BulletBlock { param([string]$Content) New-TextBlock -BlockType 12 -PropertyName "bullet" -Content $Content }
function New-OrderedBlock { param([string]$Content) New-TextBlock -BlockType 13 -PropertyName "ordered" -Content $Content }
function New-QuoteBlock { param([string]$Content) New-TextBlock -BlockType 15 -PropertyName "quote" -Content $Content }
function New-DividerBlock { @{ block_type = 22; divider = @{} } }

function Clean-MarkdownInline {
    param([string]$Text)
    $clean = $Text
    $clean = [regex]::Replace($clean, '\[([^\]]+)\]\(([^\)]+)\)', '$1 ($2)')
    $clean = $clean -replace '\*\*', ''
    $clean = $clean -replace '`', ''
    return $clean.Trim()
}

function Convert-MarkdownToFeishuBlocks {
    param([string]$Markdown)
    $blocks = New-Object System.Collections.Generic.List[object]
    $lines = $Markdown -split "`r?`n"
    $paragraphBuffer = New-Object System.Collections.Generic.List[string]

    function Flush-ParagraphBuffer {
        if ($paragraphBuffer.Count -eq 0) { return }
        $paragraph = (Clean-MarkdownInline ($paragraphBuffer -join " "))
        if ($paragraph.Length -gt 0) { $blocks.Add((New-ParagraphBlock -Content $paragraph)) }
        $paragraphBuffer.Clear()
    }

    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed)) { Flush-ParagraphBuffer; continue }

        if ($trimmed -match '^(#{1,3})\s+(.+)$') {
            Flush-ParagraphBuffer
            $level = $Matches[1].Length
            $text = Clean-MarkdownInline $Matches[2]
            switch ($level) {
                1 { $blocks.Add((New-Heading1Block -Content $text)) }
                2 { $blocks.Add((New-Heading2Block -Content $text)) }
                3 { $blocks.Add((New-Heading3Block -Content $text)) }
            }
            continue
        }

        if ($trimmed -match '^-{3,}$') {
            Flush-ParagraphBuffer
            $blocks.Add((New-DividerBlock))
            continue
        }

        if ($trimmed -match '^>\s+(.+)$') {
            Flush-ParagraphBuffer
            $blocks.Add((New-QuoteBlock -Content (Clean-MarkdownInline $Matches[1])))
            continue
        }

        if ($trimmed -match '^\-\s+(.+)$') {
            Flush-ParagraphBuffer
            $blocks.Add((New-BulletBlock -Content (Clean-MarkdownInline $Matches[1])))
            continue
        }

        if ($trimmed -match '^\d+\.\s+(.+)$') {
            Flush-ParagraphBuffer
            $blocks.Add((New-OrderedBlock -Content (Clean-MarkdownInline $Matches[1])))
            continue
        }

        if ($trimmed -match '^\|\s*.+\s*\|$') {
            Flush-ParagraphBuffer
            $blocks.Add((New-QuoteBlock -Content ("表格内容：{0}" -f (Clean-MarkdownInline $trimmed))))
            continue
        }

        $paragraphBuffer.Add($trimmed)
    }

    Flush-ParagraphBuffer
    return $blocks
}

function Add-BlocksToDocument {
    param([string]$AccessToken, [string]$DocumentId, [object[]]$Blocks)
    $headers = @{ Authorization = "Bearer $AccessToken" }
    $batchSize = 50
    for ($i = 0; $i -lt $Blocks.Count; $i += $batchSize) {
        $sliceEnd = [Math]::Min($i + $batchSize - 1, $Blocks.Count - 1)
        $chunk = if ($sliceEnd -eq $i) { @($Blocks[$i]) } else { $Blocks[$i..$sliceEnd] }
        $body = @{ index = -1; children = $chunk }
        Invoke-FeishuApi -Method "POST" -Uri "https://open.feishu.cn/open-apis/docx/v1/documents/$DocumentId/blocks/$DocumentId/children" -Headers $headers -Body $body | Out-Null
        Start-Sleep -Milliseconds 350
    }
}

$config = Read-JsonFile -Path $ConfigPath
$appId = $config.app_id
$appSecret = $config.app_secret
$resolvedFolderToken = if ($PSBoundParameters.ContainsKey("FolderToken")) { $FolderToken } else { $config.folder_token }
if (-not (Test-Path $MarkdownPath)) { throw "Markdown file not found: $MarkdownPath" }
$markdown = Get-Content $MarkdownPath -Raw -Encoding UTF8
if ([string]::IsNullOrWhiteSpace($Title)) { $Title = [System.IO.Path]::GetFileNameWithoutExtension((Resolve-Path $MarkdownPath)) }

$token = Get-TenantAccessToken -AppId $appId -AppSecret $appSecret
$documentId = $ExistingDocumentId
if ([string]::IsNullOrWhiteSpace($documentId)) {
    $documentId = New-FeishuDocument -AccessToken $token -DocTitle $Title -DocFolderToken $resolvedFolderToken
} else {
    Clear-DocumentContents -AccessToken $token -DocumentId $documentId
}

$blocks = Convert-MarkdownToFeishuBlocks -Markdown $markdown
Add-BlocksToDocument -AccessToken $token -DocumentId $documentId -Blocks $blocks
Write-Output "Created Feishu doc: https://feishu.cn/docx/$documentId"
