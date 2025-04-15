import { p as push, f as ensure_array_like, e as escape_html, h as attr, i as attr_class, j as clsx, c as pop } from './index-D7ACfpfJ.js';

function Calendar_1($$payload, $$props) {
  push();
  $$payload.out += `<div class="card bg-base-100 shadow-xl"><div class="card-body p-2"><div class="min-h-[450px]"></div></div></div>`;
  pop();
}
function _page($$payload, $$props) {
  push();
  let editingItemId = null;
  let editContent = "";
  let editStartDate = "";
  let editUrl = "";
  let editImagePreviewUrl = null;
  let items = [];
  let itemContent = "";
  let searchTerm = "";
  let searchContext = "";
  let searchItemType = "";
  let availableContexts = [];
  let todoContextFilter = "";
  function getFilteredItems() {
    const filtered = items.filter((item) => {
      const matchesSearch = !searchTerm.trim() || item.content.toLowerCase().includes(searchTerm.toLowerCase()) || (item.url?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesContext = !searchContext.trim() || item.context === searchContext;
      const matchesItemType = !searchItemType.trim() || item.type === searchItemType;
      return matchesSearch && matchesContext && matchesItemType;
    });
    return filtered.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }
  let filteredItems = getFilteredItems();
  function getCalendarEvents() {
    return items.filter((item) => item.type === "event" && item.start).map((item) => ({
      id: item.id,
      title: item.content,
      start: item.start
    }));
  }
  getCalendarEvents();
  function getTodoItems() {
    return items.filter((item) => item.type === "todo" && (item.completed === false || item.completed === null) && (todoContextFilter.trim() === "" || (item.context ?? "").toLowerCase() === todoContextFilter.toLowerCase()));
  }
  function getCompletedTodoItems() {
    return items.filter((item) => item.type === "todo" && item.completed === true && (todoContextFilter.trim() === "" || (item.context ?? "").toLowerCase() === todoContextFilter.toLowerCase()));
  }
  function getTodosByContext() {
    if (todoContextFilter.trim() !== "") {
      return null;
    }
    const todosByContext = {};
    todosByContext["No Context"] = [];
    const allTodos = items.filter((item) => item.type === "todo" && (todoContextFilter.trim() === "" || (item.context ?? "").toLowerCase() === todoContextFilter.toLowerCase()));
    for (const todo of allTodos) {
      const context = todo.context?.trim() || "No Context";
      if (!todosByContext[context]) {
        todosByContext[context] = [];
      }
      todosByContext[context].push(todo);
    }
    for (const context of Object.keys(todosByContext)) {
      if (todosByContext[context].length === 0) {
        delete todosByContext[context];
      }
    }
    return todosByContext;
  }
  let todoItems = getTodoItems();
  let completedTodoItems = getCompletedTodoItems();
  const each_array = ensure_array_like(availableContexts);
  const each_array_1 = ensure_array_like(availableContexts);
  const each_array_6 = ensure_array_like(availableContexts);
  const each_array_7 = ensure_array_like(filteredItems);
  $$payload.out += `<div id="app" class="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"><h1 class="text-3xl font-bold mb-6">My Items &amp; Events</h1> <div class="card bg-base-100 shadow-xl mb-8"><div class="card-body"><h2 class="card-title">Add New Item</h2> <form id="add-item-form"><div class="form-control w-full mb-4"><label for="item-type" class="label"><span class="label-text">Type</span></label> <select id="item-type" name="type" required class="select select-bordered w-full"><option value="note">Note</option><option value="todo">Todo</option><option value="bookmark">Bookmark</option><option value="event">Event</option></select></div> `;
  {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div class="form-control w-full mb-4"><label for="item-content" class="label"><span class="label-text">Content</span></label> <textarea id="item-content" name="content" rows="4" required placeholder="Enter details... (Paste images with Ctrl+V or Cmd+V)" class="textarea textarea-bordered w-full min-h-[80px]">`;
    const $$body_1 = escape_html(itemContent);
    if ($$body_1) {
      $$payload.out += `${$$body_1}`;
    }
    $$payload.out += `</textarea> `;
    {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div>`;
  }
  $$payload.out += `<!--]--> <div class="form-control w-full mb-4"><label for="item-context" class="label"><span class="label-text">Context (optional)</span></label> <select id="item-context" name="context" class="select select-bordered w-full"><option value="">No Context</option><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let ctx = each_array[$$index];
    $$payload.out += `<option${attr("value", ctx)}>${escape_html(ctx)}</option>`;
  }
  $$payload.out += `<!--]--><option value="__new__">+ New Context...</option></select> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="card-actions justify-end mt-4"><button type="submit" class="btn btn-primary">Add Item</button></div></form></div></div> <div class="card bg-base-100 shadow-xl mb-8"><div class="card-body"><div class="flex items-center justify-between mb-4"><h2 class="card-title">Active Todos (${escape_html(todoItems.length)})</h2> <div class="flex items-center gap-2"><label for="todo-context-filter" class="label-text">Filter by context:</label> <select id="todo-context-filter" class="select select-bordered select-sm w-32"><option value="">All</option><!--[-->`;
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let ctx = each_array_1[$$index_1];
    $$payload.out += `<option${attr("value", ctx)}>${escape_html(ctx)}</option>`;
  }
  $$payload.out += `<!--]--></select></div></div> `;
  if (todoItems.length > 0) {
    $$payload.out += "<!--[-->";
    if (todoContextFilter.trim() === "") {
      $$payload.out += "<!--[-->";
      const each_array_2 = ensure_array_like(Object.entries(getTodosByContext() || {}));
      $$payload.out += `<!--[-->`;
      for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
        let [context, todos] = each_array_2[$$index_3];
        const each_array_3 = ensure_array_like(todos.filter((todo) => !todo.completed));
        $$payload.out += `<div class="mb-4"><h3 class="font-bold text-lg mb-2">${escape_html(context)}</h3> <ul class="space-y-3"><!--[-->`;
        for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
          let todo = each_array_3[$$index_2];
          $$payload.out += `<li class="flex items-start justify-between p-3 border rounded-md bg-base-200"><div class="flex flex-col"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" class="checkbox checkbox-sm"${attr("checked", todo.completed, true)}> <span>${escape_html(todo.content)}</span></label></div> <button class="btn btn-error btn-xs">Delete</button></li>`;
        }
        $$payload.out += `<!--]--></ul></div>`;
      }
      $$payload.out += `<!--]-->`;
    } else {
      $$payload.out += "<!--[!-->";
      const each_array_4 = ensure_array_like(todoItems);
      $$payload.out += `<ul class="space-y-3"><!--[-->`;
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        let todo = each_array_4[$$index_4];
        $$payload.out += `<li class="flex items-start justify-between p-3 border rounded-md bg-base-200"><div class="flex flex-col"><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" class="checkbox checkbox-sm"${attr("checked", todo.completed, true)}> <span>${escape_html(todo.content)}</span></label></div> <button class="btn btn-error btn-xs">Delete</button></li>`;
      }
      $$payload.out += `<!--]--></ul>`;
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<p class="italic text-opacity-60">No active todos.</p>`;
  }
  $$payload.out += `<!--]--> <div class="mt-8 border-t pt-4"><div class="flex items-center justify-between mb-4"><h2 class="card-title text-lg">Completed Todos (${escape_html(completedTodoItems.length)})</h2> <button class="btn btn-sm btn-outline">${escape_html("Show")}</button></div> `;
  if (completedTodoItems.length === 0) {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<p class="italic text-opacity-60">No completed todos.</p>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></div></div> <div class="card bg-base-100 shadow-xl mb-8"><div class="card-body p-2">`;
  Calendar_1($$payload);
  $$payload.out += `<!----></div></div> <section id="search-section" class="mt-10 pt-6 border-t border-gray-200"><div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">Search / Filter</h2> <div class="form-control w-full mb-4"><label for="search-input" class="label"><span class="label-text">Search</span></label> <div class="flex gap-2"><input type="search" id="search-input" placeholder="Search items by content..."${attr("value", searchTerm)} class="input input-bordered w-full"> <button class="btn btn-outline" type="button">Clear</button></div></div> <div class="form-control w-full mb-4"><label for="context-select" class="label"><span class="label-text">Filter by Context</span></label> <select id="context-select" class="select select-bordered w-full"><option value="">All Contexts</option><!--[-->`;
  for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
    let context = each_array_6[$$index_6];
    $$payload.out += `<option${attr("value", context)}>${escape_html(context)}</option>`;
  }
  $$payload.out += `<!--]--></select></div> <div class="form-control w-full"><label for="item-type-select" class="label"><span class="label-text">Filter by Item Type</span></label> <select id="item-type-select" class="select select-bordered w-full"><option value="">All Types</option><option value="note">Note</option><option value="todo">Todo</option><option value="bookmark">Bookmark</option><option value="event">Event</option></select></div></div></div></section> <section id="items-section" class="mt-10 pt-6 border-t border-gray-200"><div class="card bg-base-100 shadow-xl"><div class="card-body"><div class="flex justify-between items-center mb-2"><h2 class="card-title">Items (${escape_html(filteredItems.length)})</h2> <button class="btn btn-sm btn-outline" type="button">Sort: ${escape_html("Newest First")}</button></div> <div id="items-list" class="mt-4 space-y-4 min-h-[100px]">`;
  if (each_array_7.length !== 0) {
    $$payload.out += "<!--[-->";
    for (let $$index_8 = 0, $$length = each_array_7.length; $$index_8 < $$length; $$index_8++) {
      let item = each_array_7[$$index_8];
      $$payload.out += `<div class="card bg-base-200"><div class="card-body p-4"><div class="flex justify-between items-start"><div><span class="badge badge-primary capitalize">${escape_html(item.type)}</span> `;
      if (item.type === "event" && item.start) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<span class="badge badge-ghost ml-2">${escape_html(new Date(item.start).toLocaleString())}</span>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--> `;
      if (item.context) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<span class="badge badge-secondary ml-2">${escape_html(item.context)}</span>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--></div></div> `;
      if (item.type === "todo") {
        $$payload.out += "<!--[-->";
        $$payload.out += `<label class="flex items-center gap-2 cursor-pointer mt-2"><input type="checkbox" class="checkbox checkbox-sm"${attr("checked", item.completed, true)}> <span${attr_class(clsx(item.completed ? "line-through opacity-60" : ""))}>${escape_html(item.content)}</span></label>`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<p class="mt-1 whitespace-pre-wrap break-words">${escape_html(item.content)}</p> `;
        if (item.type === "note" && item.imageData) {
          $$payload.out += "<!--[-->";
          $$payload.out += `<div class="mt-2"><img${attr("src", typeof item.imageData === "string" ? item.imageData : "")} alt="" class="max-w-full h-auto rounded-md mt-2"${attr("title", item.imageMimeType || "Image")}></div>`;
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]--> `;
      if (item.type === "bookmark") {
        $$payload.out += "<!--[-->";
        $$payload.out += `<a${attr("href", item.url)} target="_blank" rel="noopener noreferrer" class="link link-primary text-sm block mt-1">${escape_html(item.url)}</a>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--> <p class="text-xs opacity-60 mt-2">Added: ${escape_html(item.createdAt ? new Date(item.createdAt).toLocaleString() : "")}</p> `;
      if (editingItemId === item.id) {
        $$payload.out += "<!--[-->";
        const each_array_8 = ensure_array_like(availableContexts);
        $$payload.out += `<div class="mt-2 space-y-2"><textarea rows="3" class="textarea textarea-bordered w-full" placeholder="Enter details... (Paste images with Ctrl+V or Cmd+V)">`;
        const $$body_2 = escape_html(editContent);
        if ($$body_2) {
          $$payload.out += `${$$body_2}`;
        }
        $$payload.out += `</textarea> <select class="select select-bordered w-full"><option value="">No Context</option><!--[-->`;
        for (let $$index_7 = 0, $$length2 = each_array_8.length; $$index_7 < $$length2; $$index_7++) {
          let ctx = each_array_8[$$index_7];
          $$payload.out += `<option${attr("value", ctx)}>${escape_html(ctx)}</option>`;
        }
        $$payload.out += `<!--]--><option value="__custom__">+ Custom Context...</option></select> `;
        {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--> `;
        if (item.type === "event") {
          $$payload.out += "<!--[-->";
          $$payload.out += `<input type="datetime-local"${attr("value", editStartDate)} class="input input-bordered w-full">`;
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--> `;
        if (item.type === "bookmark") {
          $$payload.out += "<!--[-->";
          $$payload.out += `<input type="url" placeholder="Bookmark URL"${attr("value", editUrl)} class="input input-bordered w-full">`;
        } else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--> `;
        if (item.type === "note" && editImagePreviewUrl) ;
        else {
          $$payload.out += "<!--[!-->";
        }
        $$payload.out += `<!--]--> <div class="card-actions justify-end mt-2"><button class="btn btn-success btn-sm">Save</button> <button class="btn btn-neutral btn-sm">Cancel</button></div></div>`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<div class="card-actions justify-end mt-2"><button class="btn btn-info btn-sm">Edit</button> <button class="btn btn-error btn-sm">Delete</button></div>`;
      }
      $$payload.out += `<!--]--></div></div>`;
    }
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div class="alert">`;
    if (items.length === 0) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<span>No items added yet. Use the form above!</span>`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<span>No items match your search term "${escape_html(searchTerm)}".</span>`;
    }
    $$payload.out += `<!--]--></div>`;
  }
  $$payload.out += `<!--]--></div></div></div></section></div>`;
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-8gU-iu1g.js.map
