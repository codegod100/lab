use std::fmt::Debug;

fn main() {
    let f = "hello world";
    print(f);
    // println!("{:#?}",f);
}

fn print<T: Foo>(s: T){
    println!("{:#?}",s.foo());
}

trait Foo: Debug {
    fn foo(&self)->String;
}

impl<'a> Foo for &'a str{
    fn foo(&self)->String{
        self.to_string()
    }
}