###
Adapted from http://stackoverflow.com/a/10708913/742156
###

isArray = (obj) ->
  Object::toString.call(obj) is '[object Array]'

build = (first, tail) ->
  list = start(first, tail)
  keyStack = []
  doc = {}
  obj = doc
  len = list.length

  doIndent = (key) ->
    if (not obj[key]?) or obj[key] is true
      obj[key] = {}
    obj = obj[key]

  # Hack: edge-case where we essentially have an empty body:
  if (list.length is 1) and (list[0].type is 'text') and (not list[0].text?)
    return {}

  for item in list
    switch item.type
      when 'tag'
        keys = item.name.split ':'
        
        prevObj = obj # HACKish
        
        for key in keys[...-1]
          doIndent key

        key = keys[keys.length-1]
        unless obj[key]?
          obj[key] = item.value or true
        else
          if typeof obj[key] is 'string'
            obj[key] = [obj[key]]
          if isArray obj[key]
            obj[key].push item.value or true
        
        obj = prevObj # HACKish
        prev = item

      when 'indent'
        continue  if not prev?.name?
        for key in prev.name.split ':'
          doIndent(key)
        keyStack.push prev.name

      when 'outdent'
        keyStack.pop()
        obj = doc
        for name in keyStack
          for key in name.split(':')
            obj = obj[key]

      when 'text'
        item.text ?= ''
        if obj['!text']
          obj['!text'] += '\n' + item.text
        else
          obj['!text'] = item.text

  return doc

start = (first, tail) ->
  done = [first[1]]
  i = 0
  while i < tail.length
    done = done.concat tail[i][1][0]
    done.push tail[i][1][1]
    i += 1
  return done

depths = [0]

indent = (s) ->
  depth = s.length
  return []  if depth is depths[0]

  if depth > depths[0]
    depths.unshift depth
    return [type: 'indent']

  dents = []

  while depth < depths[0]
    depths.shift()
    dents.push type: 'outdent'

  dents.push type: 'baddent'  unless depth is depths[0]

  return dents
