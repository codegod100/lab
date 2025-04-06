#lang racket/gui

(require racket/draw
         racket/class
         racket/gui/base
         racket/math)

;; Constants
(define WIDTH 600)
(define HEIGHT 600)
(define MANDELBROT-WIDTH 300)
(define MANDELBROT-HEIGHT 600)
(define NUM-BLOBS 20)

;; Mandelbrot bitmap cache
(define mandelbrot-bmp (make-object bitmap% MANDELBROT-WIDTH MANDELBROT-HEIGHT))
(define mb-dc (new bitmap-dc% [bitmap mandelbrot-bmp]))

;; Define a color palette for Mandelbrot
(define mandelbrot-palette
  (list
   (make-color 66 30 15) (make-color 25 7 26) (make-color 9 1 47)
   (make-color 4 4 73) (make-color 0 7 100) (make-color 12 44 138)
   (make-color 24 82 177) (make-color 57 125 209) (make-color 134 181 229)
   (make-color 211 236 248) (make-color 241 233 191) (make-color 248 201 95)
   (make-color 255 170 0) (make-color 204 128 0) (make-color 153 87 0)
   (make-color 106 52 3)))

(define (render-mandelbrot dc x0 y0 width height)
  (define max-iter 100)
  (define palette-size (length mandelbrot-palette))
  (define cx-min -1.6)
  (define cx-max 0.2)
  (define cy-min -1.8)
  (define cy-max 1.8)
  (define cx-range (- cx-max cx-min))
  (define cy-range (- cy-max cy-min))

  (send dc set-background (make-color 0 0 0))
  (send dc clear)

  (for ([px (in-range x0 (+ x0 width))])
    (for ([py (in-range y0 (+ y0 height))])
      (define zx 0.0)
      (define zy 0.0)
      (define cx (+ cx-min (* cx-range (/ (- px x0) width))))
      (define cy (+ cy-min (* cy-range (/ (- py y0) height))))
      (define iter 0)
      (let loop ()
        (when (and (< iter max-iter)
                   (< (+ (* zx zx) (* zy zy)) 4.0))
          (define zx-temp (- (* zx zx) (* zy zy) cx))
          (set! zy (+ (* 2 zx zy) cy))
          (set! zx zx-temp)
          (set! iter (+ iter 1))
          (loop)))

      (when (< iter max-iter)
        (define color (list-ref mandelbrot-palette (modulo iter palette-size)))
        (send dc set-pen color 1 'solid)
        (send dc draw-point px py)))))

(render-mandelbrot mb-dc 0 0 MANDELBROT-WIDTH MANDELBROT-HEIGHT)

;; Store the current list of blobs as a mutable box
(define blobs (box '()))

(define (generate-blobs)
  (for/list ([i (in-range NUM-BLOBS)])
    (define x (+ 300 50 (random 100))) ; x in [350,450]
    (define y (+ 100 (random 450)))    ; y in [100,550]
    (define w (+ 30 (random 70)))
    (define h (+ 30 (random 70)))
    (define r (random 256))
    (define g (random 256))
    (define b (random 256))
    (define a 100) ; semi-transparent
    (define alpha (/ a 255.0))
    (define color (make-color r g b alpha))
    (define phase-x (random 628))
    (define phase-y (random 628))
    (define speed-x (/ (+ 50 (random 100)) 1000.0))
    (define speed-y (/ (+ 50 (random 100)) 1000.0))
    (list x y w h color phase-x phase-y speed-x speed-y)))

(set-box! blobs (generate-blobs))

(define time 0)

(define (draw-lamp-outline dc)
  (send dc set-pen "black" 4 'solid)
  (send dc set-brush (make-color 30 30 30 0.5) 'solid)
  (define points
    (list
     (cons 350 550) (cons 375 100) (cons 475 100)
     (cons 500 550) (cons 475 580) (cons 375 580)))
  (send dc draw-polygon points))

(define (draw-blobs dc blobs time)
  (send dc set-smoothing 'aligned)
  (send dc set-background (make-color 0 0 0))
  (send dc clear)
  (send dc draw-bitmap mandelbrot-bmp 0 0)
  (draw-lamp-outline dc)
  (for ([blob blobs])
    (define base-x (list-ref blob 0))
    (define base-y (list-ref blob 1))
    (define w (list-ref blob 2))
    (define h (list-ref blob 3))
    (define color (list-ref blob 4))
    (define phase-x (/ (list-ref blob 5) 100.0))
    (define phase-y (/ (list-ref blob 6) 100.0))
    (define speed-x (list-ref blob 7))
    (define speed-y (list-ref blob 8))
    (define x (+ base-x (* 50 (sin (+ (* speed-x time) phase-x)))))
    (define y (+ base-y (* 50 (sin (+ (* speed-y time) phase-y)))))
    (send dc set-brush color 'solid)
    (send dc set-pen "black" 0 'transparent)
    (send dc draw-ellipse x y w h))
  (draw-lamp-outline dc))

(define frame (new frame% [label "Lava Lamp + Mandelbrot"] [width WIDTH] [height HEIGHT]))
(define canvas
  (new canvas%
       [parent frame]
       [paint-callback
        (lambda (canvas dc)
          (draw-blobs dc (unbox blobs) time))]))

(define regenerate-button
  (new button%
       [parent frame]
       [label "New Lava"]
       [callback (lambda (button event)
                   (set-box! blobs (generate-blobs))
                   (send canvas refresh))]))

(define animation-timer
  (new timer%
       [notify-callback
        (lambda ()
          (set! time (+ time 1))
          (send canvas refresh))]
       [interval 30]))

(send frame show #t)