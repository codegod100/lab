-- Set package paths to find lpeg
package.path = package.path .. ";/home/v/.luarocks/share/lua/5.4/?.lua;/home/v/.luarocks/share/lua/5.4/?/init.lua;/home/linuxbrew/.linuxbrew/share/lua/5.4/?.lua;/home/linuxbrew/.linuxbrew/share/lua/5.4/?/init.lua"
package.cpath = package.cpath .. ";/home/v/.luarocks/lib/lua/5.4/?.so;/home/linuxbrew/.linuxbrew/lib/lua/5.4/?.so"

local l = require("lpeg")
if not l.any then l.any = l.P(1) end
if not l.char then l.char = function(c) return l.P(c) end end
if not l.space then l.space = l.S(" \t") end
if not l.newline then l.newline = function() return l.P("\n") end end
if not l.until_newline then l.until_newline = function() return l.C((l.P(1) - l.newline())^0) end end
if not l.rep then l.rep = function(p, n) return n and p^n or p^0 end end

print("Parsing org-mode text...")

-- Org-mode grammar
local newline = l.newline()
local blank_line = newline
local heading_start = l.rep(l.char("*")) * l.space
local heading_text = l.until_newline()
local heading = l.Ct(heading_start * heading_text) * newline
local paragraph_text = l.rep(l.any - newline)
local paragraph = l.Ct(paragraph_text) * newline

local line = heading + paragraph
local org_grammar = l.Ct(l.rep(line + blank_line))

-- Example Usage
local sample_org_text = [[
* Heading 1
This is a paragraph under heading 1.

** Heading 2
Another paragraph under heading 2.
]]

local parsed_result = org_grammar:match(sample_org_text)

if parsed_result then
    print("Parsing successful:")
    for i, item in ipairs(parsed_result) do
        if type(item) == "table" then
            local content = item[1]
            if type(content) == "string" then
                if content:sub(1, 1) == "*" then
                    print("  Heading: " .. content)
                else
                    print("  Paragraph: " .. content)
                end
            end
        end
    end
else
    print("Parsing failed.")
end

return org_grammar