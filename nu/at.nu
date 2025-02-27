export def get-record [uri: string] {
  let row = $uri | split row "/"
  let repo = $row | get 2
  let collection = $row | get 3
  let rkey = $row | get 4
  http get $"https://public.api.bsky.app/xrpc/com.atproto.repo.getRecord?repo=($repo)&collection=($collection)&rkey=($rkey)" | insert repo $repo | insert collection $collection | insert rkey $rkey
}
