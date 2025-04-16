package main

import (
    "encoding/json"
    "fmt"
    "log"

    "github.com/gofiber/fiber/v3"
)

func main() {
    app := fiber.New()

    app.Get("/api/*", func(c fiber.Ctx) error {
        msg := fmt.Sprintf("✋ %s", c.Params("*"))
        return c.SendString(msg) // => ✋ register
    }).Name("api")

    route := app.GetRoute("api")

    data, _ := json.MarshalIndent(route, "", "  ")
    fmt.Println(string(data))
    // Prints:
    // {
    //    "method": "GET",
    //    "name": "api",
    //    "path": "/api/*",
    //    "params": [
    //      "*1"
    //    ]
    // }

    log.Fatal(app.Listen(":3000"))
}