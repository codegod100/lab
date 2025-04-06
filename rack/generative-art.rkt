#lang racket/gui

(require racket/draw
         racket/class
         racket/gui/base
         racket/math)

(define frame (new frame%
                   [label "Lava Lamp"]
                   [width 600]
                   [height 600]))

;; Store the current list of blobs as a mutable box
(define blobs (box '()))

(define (generate-blobs width height)
  (define num-blobs 20)
  (for/list ([i (in-range num-blobs)])
    ;; restrict x,y to inside lamp interior bounding box
    (define x (+ 250 (random 100))) ; x in [250,350]
    (define y (+ 100 (random 450))) ; y in [100,550]
    (define w (+ 30 (random 70)))   ; smaller blobs to fit better
    (define h (+ 30 (random 70)))
    (define r (random 256))
    (define g (random 256))
    (define b (random 256))
    (define a 100) ; semi-transparent
    (define alpha (/ a 255.0))
    (define color (make-color r g b alpha))
    (define phase-x (random 628)) ; 0 to 2pi*100 scaled
    (define phase-y (random 628))
    (define speed-x (/ (+ 50 (random 100)) 1000.0)) ; 0.05 to 0.15
    (define speed-y (/ (+ 50 (random 100)) 1000.0))
    (list x y w h color phase-x phase-y speed-x speed-y)))

(set-box! blobs (generate-blobs 600 600))

(define time 0)

(define (draw-lamp-outline dc)
  (send dc set-pen "black" 4 'solid)
  (send dc set-brush (make-color 30 30 30 0.5) 'solid)
  ;; Define lamp polygon points
  (define points
    (list
     (cons 200 550) ; bottom left
     (cons 250 100) ; neck left
     (cons 350 100) ; neck right
     (cons 400 550) ; bottom right
     (cons 350 580) ; base right
     (cons 250 580))) ; base left
  (send dc draw-polygon points))

(define (draw-blobs dc blobs time)
  (send dc set-smoothing 'aligned)
  (send dc set-background (make-color 0 0 0))
  (send dc clear)
  ;; Draw lamp outline first
  (draw-lamp-outline dc)
  ;; Draw blobs inside lamp
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
  ;; Draw lamp outline again on top for border emphasis
  (draw-lamp-outline dc))

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
                   (set-box! blobs (generate-blobs 600 600))
                   (send canvas refresh))]))

;; Animation timer
(define animation-timer
  (new timer%
       [notify-callback
        (lambda ()
          (set! time (+ time 1))
          (send canvas refresh))]
       [interval 30])) ; ~33 FPS

(send frame show #t)