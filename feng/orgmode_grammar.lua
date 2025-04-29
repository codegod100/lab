local l = require("lpeg")
if not l.any then l.any = l.P(1) end
if not l.char then l.char = function(c) return l.P(c) end end
if not l.space then l.space = l.S(" \t") end
local newline = l.P("\n") -- Define newline directly
if not l.until_newline then l.until_newline = function(p) return l.C(l.rep(p - newline)^0) end end -- Adjusted until_newline to take a pattern
if not l.rep then l.rep = function(p, n) return n and p^n or p^0 end end

print("Parsing org-mode text using Lua string manipulation...")

-- Example Usage
local sample_org_text = [[
* Heading 1
This is a paragraph under heading 1.

** Heading 2
- List item 1
- List item 2

#+BEGIN_SRC
print("Hello, world!")
#+END_SRC

Another paragraph.
]]

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
    local entities = {
        ["&"] = "&",
        ["<"] = "<",
        [">"] = ">",
        ['"'] = '"',
        ["'"] = "'"
    }
    return (text:gsub("[&<>\'\"]", entities))
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
            table.insert(html, string.format("<h%d>%s</h%d>", #level, escape_html(text), #level))
        elseif line:match("^[-+*]%s") then
            close_code()
            if not in_list then
                table.insert(html, "<ul>")
                in_list = true
            end
            local text = line:match("^[-+*]%s*(.*)")
            table.insert(html, string.format("<li>%s</li>", escape_html(text)))
        elseif line:match("^#%+BEGIN_SRC") then
            close_list()
            close_code() -- Close any existing code block before starting a new one
            table.insert(html, "<pre><code>")
            in_code = true
        elseif line:match("^#%+END_SRC") then
            close_code()
        elseif in_code then
            -- Add escaped line content without extra newline
            table.insert(html, escape_html(line))
        elseif line:match("^%s*$") then
            -- Ignore blank lines outside of code blocks
            close_list()
            close_code()
        else
            close_list()
            close_code()
            table.insert(html, string.format("<p>%s</p>", escape_html(line)))
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