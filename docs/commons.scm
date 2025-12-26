;;; commons.scm - Entity-centric commons framework
;;; Everything is an entity: resources, processes, allocations, sets, needs, capacities

(define-module (commons)
  #:export (;; Core entity operations
            make-entity
            entity-id
            entity-history
            entity-methods
            entity-add-method
            entity-update-method
            entity-delete-method
            entity-get-method
            entity-execute-method
            ;; History operations
            make-history
            history-append
            history-entries
            make-history-entry
            ;; Entity factories for common patterns
            make-set-entity
            make-allocation-entity
            make-resource-entity
            make-class-entity
            ;; Standard method templates
            template-need
            template-capacity
            template-filter
            template-normalizer
            template-aggregate
            template-contains
            ;; Utilities
            alist-copy
            assoc-ref
            assoc-set
            assoc-remove))

;;; ============================================================================
;;; HISTORY - Immutable append-only log
;;; ============================================================================

(define (make-history . entries)
  "Create a history log from entries"
  (lambda (operation)
    (cond
      ((eq? operation 'entries) entries)
      ((eq? operation 'append)
       (lambda (new-entry)
         (apply make-history (append entries (list new-entry)))))
      ((eq? operation 'length) (length entries))
      (else (error "Unknown history operation" operation)))))

(define (history-append history entry)
  "Append an entry to history (returns new history)"
  ((history 'append) entry))

(define (history-entries history)
  "Get all entries from history"
  (history 'entries))

(define (current-time)
  "Portable timestamp function"
  (if (defined? 'current-seconds)
      (current-seconds)
      0)) ; fallback for portability

(define (make-history-entry operation-type operation-name inputs results)
  "Create a history entry record"
  (list (cons 'operation-type operation-type)
        (cons 'operation-name operation-name)
        (cons 'inputs inputs)
        (cons 'results results)
        (cons 'timestamp (current-time))))

;;; ============================================================================
;;; ASSOCIATION LIST HELPERS (pure functional)
;;; ============================================================================

(define (alist-copy alist)
  "Create a copy of an association list"
  (map (lambda (pair) (cons (car pair) (cdr pair))) alist))

(define (assoc-ref alist key)
  "Return the value associated with key in alist or #f if not found"
  (let ((p (assoc key alist)))
    (if p (cdr p) #f)))

(define (assoc-set alist key value)
  "Return a new alist where key -> value (replace if present or add otherwise)"
  (let loop ((rest alist) (acc '()))
    (cond
      ((null? rest)
       (append (reverse acc) (list (cons key value))))
      ((equal? (caar rest) key)
       (append (reverse acc) (cons (cons key value) (cdr rest))))
      (else (loop (cdr rest) (cons (car rest) acc))))))

(define (assoc-remove alist key)
  "Return a new alist with key removed (no mutation)"
  (filter (lambda (p) (not (equal? (car p) key))) alist))

;;; ============================================================================
;;; ENTITY - The universal building block
;;; ============================================================================
;;; An entity maintains:
;;; - id: unique identifier (pubkey or symbolic)
;;; - history: immutable log of all operations
;;; - methods: map of symbols to code-as-data (s-expressions)
;;; - data: arbitrary data storage (for state like member lists, quantities, etc.)

(define (make-entity id)
  "Create a new entity with the given id"
  (let ((history (make-history))
        (methods '())
        (data '()))  ; data storage for entity state
    (lambda (selector . args)
      (cond
        ;; Accessors
        ((eq? selector 'id) id)
        ((eq? selector 'history) history)
        ((eq? selector 'methods) methods)
        ((eq? selector 'data) data)
        
        ;; Data operations (for storing entity state)
        ((eq? selector 'get-data)
         (let ((key (car args)))
           (assoc-ref data key)))
        
        ((eq? selector 'set-data)
         (let* ((key (car args))
                (value (cadr args))
                (entry (make-history-entry 'data-set key (list value) value))
                (new-history (history-append history entry))
                (new-data (assoc-set data key value)))
           (make-entity-with-state id new-history methods new-data)))
        
        ;; CRUD operations for methods
        ((eq? selector 'add-method)
         (let* ((method-name (car args))
                (method-code (cadr args))
                (entry (make-history-entry 'method-create method-name 
                                          (list method-code) method-name))
                (new-history (history-append history entry))
                (new-methods (cons (cons method-name method-code) methods)))
           (make-entity-with-state id new-history new-methods data)))
        
        ((eq? selector 'update-method)
         (let* ((method-name (car args))
                (method-code (cadr args))
                (old-code (assoc-ref methods method-name))
                (entry (make-history-entry 'method-update method-name 
                                          (list old-code method-code) method-name))
                (new-history (history-append history entry))
                (new-methods (assoc-set methods method-name method-code)))
           (make-entity-with-state id new-history new-methods data)))
        
        ((eq? selector 'delete-method)
         (let* ((method-name (car args))
                (old-code (assoc-ref methods method-name))
                (entry (make-history-entry 'method-delete method-name 
                                          (list old-code) #f))
                (new-history (history-append history entry))
                (new-methods (assoc-remove methods method-name)))
           (make-entity-with-state id new-history new-methods data)))
        
        ((eq? selector 'get-method)
         (let ((method-name (car args)))
           (assoc-ref methods method-name)))
        
        ;; Execute a method by symbol
        ((eq? selector 'execute-method)
         (let* ((method-name (car args))
                (method-args (if (> (length args) 1) (cdr args) '()))
                (method-code (assoc-ref methods method-name)))
           (if method-code
               (let* ((method-fn (eval method-code (interaction-environment)))
                      (result (apply method-fn method-args))
                      (entry (make-history-entry 'method-execute method-name 
                                                method-args result))
                      (new-history (history-append history entry)))
                 (cons result (make-entity-with-state id new-history methods data)))
               (error "Method not found" method-name))))
        
        (else (error "Unknown entity operation" selector))))))

(define (make-entity-with-state id history methods data)
  "Create an entity with pre-existing state"
  (lambda (selector . args)
    (cond
      ((eq? selector 'id) id)
      ((eq? selector 'history) history)
      ((eq? selector 'methods) methods)
      ((eq? selector 'data) data)
      
      ((eq? selector 'get-data)
       (let ((key (car args)))
         (assoc-ref data key)))
      
      ((eq? selector 'set-data)
       (let* ((key (car args))
              (value (cadr args))
              (entry (make-history-entry 'data-set key (list value) value))
              (new-history (history-append history entry))
              (new-data (assoc-set data key value)))
         (make-entity-with-state id new-history methods new-data)))
      
      ((eq? selector 'add-method)
       (let* ((method-name (car args))
              (method-code (cadr args))
              (entry (make-history-entry 'method-create method-name 
                                        (list method-code) method-name))
              (new-history (history-append history entry))
              (new-methods (cons (cons method-name method-code) methods)))
         (make-entity-with-state id new-history new-methods data)))
      
      ((eq? selector 'update-method)
       (let* ((method-name (car args))
              (method-code (cadr args))
              (old-code (assoc-ref methods method-name))
              (entry (make-history-entry 'method-update method-name 
                                        (list old-code method-code) method-name))
              (new-history (history-append history entry))
              (new-methods (assoc-set methods method-name method-code)))
         (make-entity-with-state id new-history new-methods data)))
      
      ((eq? selector 'delete-method)
       (let* ((method-name (car args))
              (old-code (assoc-ref methods method-name))
              (entry (make-history-entry 'method-delete method-name 
                                        (list old-code) #f))
              (new-history (history-append history entry))
              (new-methods (assoc-remove methods method-name)))
         (make-entity-with-state id new-history new-methods data)))
      
      ((eq? selector 'get-method)
       (let ((method-name (car args)))
         (assoc-ref methods method-name)))
      
      ((eq? selector 'execute-method)
       (let* ((method-name (car args))
              (method-args (if (> (length args) 1) (cdr args) '()))
              (method-code (assoc-ref methods method-name)))
         (if method-code
             (let* ((method-fn (eval method-code (interaction-environment)))
                    (result (apply method-fn method-args))
                    (entry (make-history-entry 'method-execute method-name 
                                              method-args result))
                    (new-history (history-append history entry)))
               (cons result (make-entity-with-state id new-history methods data)))
             (error "Method not found" method-name))))
      
      (else (error "Unknown entity operation" selector)))))

;;; ============================================================================
;;; PUBLIC API FOR ENTITY OPERATIONS
;;; ============================================================================

(define (entity-id entity)
  "Get the id of an entity"
  (entity 'id))

(define (entity-history entity)
  "Get the history of an entity"
  (entity 'history))

(define (entity-methods entity)
  "Get all methods of an entity as an association list"
  (entity 'methods))

(define (entity-add-method entity method-name method-code)
  "Add a new method to an entity (returns new entity)"
  (entity 'add-method method-name method-code))

(define (entity-update-method entity method-name method-code)
  "Update an existing method in an entity (returns new entity)"
  (entity 'update-method method-name method-code))

(define (entity-delete-method entity method-name)
  "Delete a method from an entity (returns new entity)"
  (entity 'delete-method method-name))

(define (entity-get-method entity method-name)
  "Get the code of a method by name"
  (entity 'get-method method-name))

(define (entity-execute-method entity method-name . args)
  "Execute a method by name with arguments (returns (result . new-entity))"
  (apply entity 'execute-method method-name args))

;;; ============================================================================
;;; ENTITY FACTORIES - Common patterns as entities
;;; ============================================================================

(define (make-set-entity id member-ids)
  "Create a set entity that manages a collection of member IDs"
  (let ((entity (make-entity id)))
    (entity 'set-data 'members member-ids)
    (entity-add-method entity 'contains?
      '(lambda (id)
         (member id (entity 'get-data 'members))))
    (entity-add-method entity 'add-member
      '(lambda (id)
         (let ((current (entity 'get-data 'members)))
           (entity 'set-data 'members (cons id current)))))
    (entity-add-method entity 'remove-member
      '(lambda (id)
         (let ((current (entity 'get-data 'members)))
           (entity 'set-data 'members (filter (lambda (x) (not (equal? x id))) current)))))
    (entity-add-method entity 'size
      '(lambda ()
         (length (entity 'get-data 'members))))))

(define (make-allocation-entity id target-ids filter1 normalizer filter2)
  "Create an allocation entity that applies filter-normalize-filter pipeline"
  (let ((entity (make-entity id)))
    (entity 'set-data 'target-ids target-ids)
    (entity 'set-data 'filter1 filter1)
    (entity 'set-data 'normalizer normalizer)
    (entity 'set-data 'filter2 filter2)
    (entity-add-method entity 'apply
      '(lambda ()
         (let* ((ids (entity 'get-data 'target-ids))
                (f1 (entity 'get-data 'filter1))
                (norm (entity 'get-data 'normalizer))
                (f2 (entity 'get-data 'filter2))
                (stage1 (filter f1 ids))
                (normalized (map norm stage1))
                (stage2 (filter f2 normalized)))
           stage2)))))

(define (make-resource-entity id quantity unit)
  "Create a resource entity with quantity and unit"
  (let ((entity (make-entity id)))
    (entity 'set-data 'quantity quantity)
    (entity 'set-data 'unit unit)
    (entity-add-method entity 'get-quantity
      '(lambda ()
         (entity 'get-data 'quantity)))
    (entity-add-method entity 'set-quantity
      '(lambda (new-qty)
         (entity 'set-data 'quantity new-qty)))
    (entity-add-method entity 'get-unit
      '(lambda ()
         (entity 'get-data 'unit)))))

(define (make-class-entity id member-ids)
  "Create a class/type entity that represents a category of entities"
  (let ((entity (make-set-entity id member-ids)))
    (entity-add-method entity 'aggregate
      '(lambda (method-name)
         ;; Aggregate results from calling method-name on all members
         (map (lambda (member-id)
                ;; In real implementation, would lookup entity and call method
                member-id)
              (entity 'get-data 'members))))))

;;; ============================================================================
;;; STANDARD METHOD TEMPLATES - Commons ontology
;;; ============================================================================

(define (template-need)
  "Template for expressing a need (returns quantity required)"
  '(lambda ()
     ;; Override with specific need calculation
     0))

(define (template-capacity)
  "Template for expressing a capacity (returns quantity available)"
  '(lambda ()
     ;; Override with specific capacity calculation
     0))

(define (template-filter)
  "Template for filtering entities"
  '(lambda (entity-id)
     ;; Override with specific filter logic
     #t))

(define (template-normalizer)
  "Template for normalizing/transforming entities"
  '(lambda (entity-id)
     ;; Override with specific normalization logic
     entity-id))

(define (template-aggregate)
  "Template for aggregating values across a set"
  '(lambda (entity-ids)
     ;; Override with specific aggregation logic (sum, average, etc.)
     (length entity-ids)))

(define (template-contains)
  "Template for membership testing"
  '(lambda (entity-id)
     ;; Override with specific containment logic
     #f))
