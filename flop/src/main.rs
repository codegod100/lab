use std::fmt::Debug;
use std::io::{Error, ErrorKind};

fn main() {
    // let f = "hello world test words yolo";
    // let f = "hello";
    print("");
    print("hello");
    print("yolo molo");
    print("one two three");
    print("one two three four")
}

fn print<T: Foo>(s: T){
    println!("{:#?}",s.foo());
    if let Ok(bar) = s. bar(){
        if bar.first == ""{
            println!("warning: empty");
        }
        println!("{:#?}", bar);
    }
}

#[derive(Debug)]
struct Bar{
    first: String,
    second: String,
    rest: String
}
trait Foo: Debug  {
    fn foo(&self)->String;
    fn bar(&self)->Result<Bar,Error>;
}

impl<'a> Foo for &'a str{
    fn foo(&self)->String{
        self.to_string()
    }
    fn bar(&self)->Result<Bar,Error>{
        let mut words: Vec<&str> = self.split_whitespace().collect();
        if words.len() < 2{
            words.push("");
        }
        if self.len() < 1{
            // return Err(Error::other("expected more than one word"))
            words.push("");
        }
        let rest: String = words[2..words.len()].join(" ");
        let b = Bar{first: words[0].to_string(), second: words[1].to_string(), rest};
        Ok(b)
    }
}