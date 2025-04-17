use dioxus::prelude::*;

#[component]
pub fn StatsCard(
    title: String,
    value: String,
    icon: String,
    color: String,
    change: Option<(f32, bool)>, // (percentage, is_positive)
) -> Element {
    let bg_class = match color.as_str() {
        "blue" => "bg-blue-900/20 border-blue-500/50",
        "green" => "bg-green-900/20 border-green-500/50",
        "yellow" => "bg-yellow-900/20 border-yellow-500/50",
        "purple" => "bg-purple-900/20 border-purple-500/50",
        "red" => "bg-red-900/20 border-red-500/50",
        _ => "bg-gray-800 border-gray-700",
    };
    
    let icon_class = match color.as_str() {
        "blue" => "text-blue-400",
        "green" => "text-green-400",
        "yellow" => "text-yellow-400",
        "purple" => "text-purple-400",
        "red" => "text-red-400",
        _ => "text-gray-400",
    };
    
    rsx! {
        div { 
            class: "rounded-lg border p-4 shadow-md {bg_class}",
            
            div { class: "flex justify-between items-start",
                div {
                    h3 { class: "text-sm font-medium text-gray-400", "{title}" }
                    p { class: "text-2xl font-bold mt-1 text-white", "{value}" }
                    
                    if let Some((percentage, is_positive)) = change {
                        div { 
                            class: "mt-1 flex items-center text-xs",
                            span { 
                                class: if is_positive { "text-green-400" } else { "text-red-400" },
                                if is_positive { "↑" } else { "↓" }
                                " {percentage:.1}%"
                            }
                            span { class: "ml-1 text-gray-400", "from last period" }
                        }
                    }
                }
                
                div { 
                    class: "flex h-10 w-10 items-center justify-center rounded-full {icon_class} bg-opacity-10",
                    span { class: "text-xl", "{icon}" }
                }
            }
        }
    }
}
