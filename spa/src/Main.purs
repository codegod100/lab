module Main where

import Prelude

import Effect (Effect)
import Effect.Console (log)

greet :: String -> String
greet name = "Hi " <> name <> "!"

main :: Effect Unit
main = do
  log (greet "foo")
module Main where

import Prelude

import Effect (Effect)
import Effect.Console (log)

main :: Effect Unit
main = do
  log "🍝"
