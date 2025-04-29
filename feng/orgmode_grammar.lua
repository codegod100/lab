local l = require("lpeg")
if not l.any then l.any = l.P(1) end
if not l.char then l.char = function(c) return l.P(c) end end
if not l.space then l.space = l.S(" \t") end
local newline = l.P("\n") -- Define newline directly
if not l.until_newline then l.until_newline = function(p) return l.C(l.rep(p - newline)^0) end end -- Adjusted until_newline to take a pattern
if not l.rep then l.rep = function(p, n) return n and p^n or p^0 end end

print("Parsing org-mode text using Lua string manipulation...")

-- Example Usage
local sample_org_text = ""
sample_org_text = sample_org_text .. "* Heading 1\n"
sample_org_text = sample_org_text .. "This is a paragraph with *bold*, /italic/, _underline_, and +strikethrough+ text.\n"
sample_org_text = sample_org_text .. "\n"
sample_org_text = sample_org_text .. "** Heading 2\n"
sample_org_text = sample_org_text .. "- List item 1\n"
sample_org_text = sample_org_text .. "- List item 2\n"
sample_org_text = sample_org_text .. "\n"
sample_org_text = sample_org_text .. "#+BEGIN_SRC\n"
sample_org_text = sample_org_text .. "print(\"Hello, world!\")\n"
sample_org_text = sample_org_text .. "#+END_SRC\n"
sample_org_text = sample_org_text .. "\n"
sample_org_text = sample_org_text .. "Another paragraph with a [[https://www.example.com][link to example.com]].\n"
sample_org_text = sample_org_text .. "And another link: [[https://www.google.com]].\n"
sample_org_text = sample_org_text .. "\n"
sample_org_text = sample_org_text .. "-----\n"
sample_org_text = sample_org_text .. "\n"
sample_org_text = sample_org_text .. "Final paragraph.\n"


-- Split text into lines using Lua string manipulation
local lines = {}
for line in sample_org_text:gmatch("([^\n]*)") do
    table.insert(lines, line)
end
-- Remove the last empty string if the text ends with a newline
if #lines > 0 and lines[#lines] == "" and sample_org_text:sub(-1) == "\n" then
    table.remove(lines)
end


-- Debug print lines
print("Debug: lines type:", type(lines))
if type(lines) == "table" then
    print("Debug: lines content:")
    for i, v in ipairs(lines) do
        print("  ", i, ":", type(v), v)
    end
end

local function escape_html(text)
    -- Only escape characters that aren't part of HTML tags
    if not text:match("<[^>]+>") then
        local entities = {
            ["&"] = "&amp;",
            ["<"] = "&lt;",
            [">"] = "&gt;",
            ['"'] = "&quot;",
            ["'"] = "&#39;"
        }
        return (text:gsub("[&<>\'\"]", entities))
    end
    return text
end

local function process_inline_markup(text)
    local result = text

    -- Process markup styles one at a time in specific order
    for _, style in ipairs({
        {marker = "%*", tag = "strong"},   -- Bold
        {marker = "/", tag = "em"},        -- Italic
        {marker = "_", tag = "u"},         -- Underline
        {marker = "%+", tag = "del"}       -- Strikethrough
    }) do
        -- Find all instances of the marker in text
        local positions = {}
        for pos in result:gmatch("()" .. style.marker) do
            table.insert(positions, pos)
        end
        
        -- Process pairs of markers from the end
        for i = #positions-1, 1, -2 do
            local start_pos = positions[i]
            local end_pos = positions[i+1]
            if start_pos and end_pos then
                local prefix = result:sub(1, start_pos-1)
                local content = result:sub(start_pos+1, end_pos-1)
                local suffix = result:sub(end_pos+1)
                -- Only process if markers are at word boundaries
                if (start_pos == 1 or prefix:match("[%s%p]$")) and
                   (end_pos == #result or suffix:match("^[%s%p]")) then
                    result = prefix .. "<" .. style.tag .. ">" .. content .. "</" .. style.tag .. ">" .. suffix
                end
            end
        end
    end
    
    -- Process links last
    result = result:gsub("%[%[([^%]]+)%]%[([^%]]+)%]%]", "<a href='%1'>%2</a>") -- [[url][description]]
    result = result:gsub("%[%[([^%]]+)%]%]", "<a href='%1'>%1</a>") -- [[url]]
    
    return result
end

local function orgmode_to_html(lines)
    local html = {}
    local in_list = false
    local in_code = false

    local function close_list()
        if in_list then
            table.insert(html, "</ul>")
            in_list = false
        end
    end

    local function close_code()
        if in_code then
            table.insert(html, "</code></pre>")
            in_code = false
        end
    end

    for _, line in ipairs(lines) do
        print("Debug: orgmode_to_html processing line:", line) -- Debug print
        if line:match("^%*+%s") then
            close_list()
            close_code()
            local level = line:match("^%*+")
            local text = line:match("^%*+%s*(.*)")
            text = process_inline_markup(text) -- Process inline markup in headings
            table.insert(html, string.format("<h%d>%s</h%d>", #level, text, #level))
        elseif line:match("^[-+*]%s") then
            close_code()
            if not in_list then
                table.insert(html, "<ul>")
                in_list = true
            end
            local text = line:match("^[-+*]%s*(.*)")
            text = process_inline_markup(text) -- Process inline markup in list items
            table.insert(html, string.format("<li>%s</li>", text))
        elseif line:match("^#%+BEGIN_SRC") then
            close_list()
            close_code()
            table.insert(html, "<pre><code>")
            in_code = true
        elseif line:match("^#%+END_SRC") then
            close_code()
        elseif in_code then
            -- Add code content without HTML escaping
            table.insert(html, line)
        elseif line:match("^%s*%-{5,} *$") then -- Horizontal rule
            close_list()
            close_code()
            table.insert(html, "<hr>")
        elseif line:match("^%s*$") then
            -- Handle blank lines
            close_list()
            close_code()
        else
            close_list()
            close_code()
            -- Process inline markup before wrapping in paragraph tags
            local processed_text = process_inline_markup(line)
            table.insert(html, string.format("<p>%s</p>", processed_text))
        end
    end

    close_list()
    close_code()

    -- Remove trailing blank lines from the html table
    while #html > 0 and html[#html]:match("^%s*$") do
        table.remove(html)
    end

    return table.concat(html, "\n")
end

if lines then -- Check if lines table exists
    print("Parsing successful:")
    local html_output = orgmode_to_html(lines)
    print("Generated HTML:")
    print(html_output)
else
    print("Parsing failed.") -- This case should not be reached with string.gmatch
end

return nil -- Return nil as grammar is removed