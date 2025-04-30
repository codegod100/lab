-- orgmode_lpeg.lua  — org-mode to HTML via LPeg PEG grammar

local lpeg = require("lpeg")
local P, S, C, Ct = lpeg.P, lpeg.S, lpeg.C, lpeg.Ct

-- Escape HTML where needed
local function escape_html(text)
    local entities = { ['&']='&amp;' , ['<']='&lt;' , ['>']='&gt;' , ['"']='&quot;' , ["'"]="&#39;" }
    return (text:gsub("[&<>'\"]", entities))
end

-- Inline LPeg grammar for Org-mode inline markup
local function inline_grammar()
    local lpeg = require("lpeg")
    local P, S, C, Ct, Cg, Cmt = lpeg.P, lpeg.S, lpeg.C, lpeg.Ct, lpeg.Cg, lpeg.Cmt
    local V = lpeg.V

    local function escape_html(text)
        local entities = { ['&']='&amp;' , ['<']='&lt;' , ['>']='&gt;' , ['\"']='&quot;' , ["'"]="&#39;" }
        return (text:gsub("[&<>'\"]", entities))
    end

    -- Patterns for inline elements
    local lbracket = P"[["
    local rbracket = P"]]"
    local link_url = C((1 - P"]")^1)
    local link_desc = C((1 - P"]")^1)
    -- [[url][desc]]
    local link_with_desc = P"[[" * link_url * P"][" * link_desc * P"]]" / function(url, desc) return string.format("<a href='%s'>%s</a>", url, desc) end
    -- [[url]]
    local link = P"[[" * link_url * P"]]" / function(url) return string.format("<a href='%s'>%s</a>", url, url) end

    local bold = P"*" * C((1 - P"*")^1) * P"*" / function(txt) return "<strong>"..escape_html(txt).."</strong>" end
    local italic = P"/" * C((1 - P"/")^1) * P"/" / function(txt) return "<em>"..escape_html(txt).."</em>" end
    local underline = P"_" * C((1 - P"_")^1) * P"_" / function(txt) return "<u>"..escape_html(txt).."</u>" end
    local strike = P"+" * C((1 - P"+")^1) * P"+" / function(txt) return "<del>"..escape_html(txt).."</del>" end
    local code = P"~" * C((1 - P"~")^1) * P"~" / function(txt) return "<code>"..escape_html(txt).."</code>" end

    -- Fallback for plain text (up to next special char or link start)
    local plain = C((1 - S"*_/+~[")^1) / escape_html

    local inline = Ct((link_with_desc + link + bold + italic + underline + strike + code + plain)^1)

    return function(text)
        if not text or text == '' then return '' end
        local html_parts = inline:match(text)
        if not html_parts then return escape_html(text) end
        return table.concat(html_parts)
    end
end

-- Replace process_inline with inline_grammar()
local process_inline = inline_grammar()

-- Build PEG grammar for block-level Org elements
local function org_grammar()
    local V = lpeg.V -- For forward/recursive references

    -- Basic patterns (defined outside G for clarity, they don't need recursion)
    local newline = P("\r")^-1 * P("\n")
    local space = S(" \t")^0
    local blank_line = space * newline
    local non_empty_line_content = C((1 - newline)^1)
    local line_content = C((1 - newline)^0)
    local any_line = line_content * newline

    -- Grammar table using P{} for recursive definitions
    local G = P{ "Start"; -- Define 'Start' as the initial rule

        -- Heading: * Title \n
        Heading = C(P("*")^1) * space * line_content * newline / function(stars, txt) io.stderr:write("Debug: Matched Heading\n") return string.format("<h%d>%s</h%d>", #stars, process_inline(txt or ""), #stars) end,

        -- Hrule: ----- \n
        Hrule = P("-----") * P("-")^0 * newline / function() io.stderr:write("Debug: Matched Hrule\n") return "<hr>" end,

        -- ListItem: - Text \n
        ListItem = S("-+") * space * line_content * newline / function(txt) io.stderr:write("Debug: Matched ListItem\n") return string.format("<li>%s</li>", process_inline(txt)) end,

        -- CodeBlock: #+BEGIN_SRC ... #+END_SRC \n
        CodeBlockBegin = P("#+BEGIN_SRC") * P("\n"),
        CodeBlockEnd = P("#+END_SRC") * P("\n"),
        CodeBlock = V"CodeBlockBegin" * C((1 - V"CodeBlockEnd")^0) * V"CodeBlockEnd" / 
            function(content) io.stderr:write("Debug: Matched CodeBlock\n") return "<pre><code>\n"..escape_html(content).."\n</code></pre>" end,

        -- Paragraph: Sequence of lines not starting blocks or blank
        ParaLineStart = -(V"Heading" + V"Hrule" + V"ListItem" + V"CodeBlockBegin" + blank_line),
        ParaLine = V"ParaLineStart" * non_empty_line_content * newline,
        Paragraph = C((V"ParaLine")^1) / function(para_text) io.stderr:write("Debug: Matched Paragraph\n") local text = para_text:gsub("\n", " ") text = text:match("^%s*(.-)%s*$") if text == "" then return nil end return string.format("<p>%s</p>", process_inline(text)) end,

        -- Blank line handler (returns empty string)
        Blank = blank_line / function() return "" end,

        -- Define the choice for what constitutes a processable block/element
        Block = V"Heading" + V"Hrule" + V"ListItem" + V"CodeBlock" + V"Paragraph" + V"Blank",

        -- Top level: Sequence of Blocks until EOF, allowing trailing blanks
        Start = Ct(V"Block"^0) * blank_line^0 * P(-1)
    }

    return G -- Return the compiled grammar table (starts implicitly from G[1] or G.Start)
end

-- Convert Org text to HTML
local function orgmode_to_html(text)
    local parts = org_grammar():match(text)  -- Ensure full matching by potentially wrapping or adjusting input
    if not parts then parts = {} end  -- Fallback to avoid nil
    local html = {}
    for _, v in ipairs(parts) do
        io.stderr:write("Debug: Captured part type: " .. type(v) .. ", content: " .. tostring(v) .. "\n")
        if v then table.insert(html, v) end
    end
    return table.concat(html, "\n")
end

-- Test runner
if arg and arg[0]:match("grammar.lua$") then
    local test_org = [=[
* Heading 1
This is a paragraph with *bold*, /italic/, _underline_, and +strikethrough+ text.

** Heading 2
- List item 1
- List item 2

#+BEGIN_SRC
print("Hello, world!")
#+END_SRC

Another paragraph with a [[https://www.example.com][link to example.com]].
And another link: [[https://www.google.com]].

-----
Final paragraph.
]=] .. "\n"  -- Ensure trailing newline
    -- Write the entire HTML output to a file
    local html = orgmode_to_html(test_org)
    io.stderr:write("\n--- Raw captured parts ---\n")
    local parts = org_grammar():match(test_org)
    if parts then
        for i, v in ipairs(parts) do
            io.stderr:write(string.format("Part %d: %s\n", i, tostring(v)))
        end
    end
    io.stderr:write("\n--- Final HTML output ---\n")
    print(html)
end