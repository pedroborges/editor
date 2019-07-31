// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/orderedmap/index.js":[function(require,module,exports) {
// ::- Persistent data structure representing an ordered mapping from
// strings to values, with some convenient update methods.
function OrderedMap(content) {
  this.content = content
}

OrderedMap.prototype = {
  constructor: OrderedMap,

  find: function(key) {
    for (var i = 0; i < this.content.length; i += 2)
      if (this.content[i] === key) return i
    return -1
  },

  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(key) {
    var found = this.find(key)
    return found == -1 ? undefined : this.content[found + 1]
  },

  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(key, value, newKey) {
    var self = newKey && newKey != key ? this.remove(newKey) : this
    var found = self.find(key), content = self.content.slice()
    if (found == -1) {
      content.push(newKey || key, value)
    } else {
      content[found + 1] = value
      if (newKey) content[found] = newKey
    }
    return new OrderedMap(content)
  },

  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(key) {
    var found = this.find(key)
    if (found == -1) return this
    var content = this.content.slice()
    content.splice(found, 2)
    return new OrderedMap(content)
  },

  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(key, value) {
    return new OrderedMap([key, value].concat(this.remove(key).content))
  },

  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(key, value) {
    var content = this.remove(key).content.slice()
    content.push(key, value)
    return new OrderedMap(content)
  },

  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(place, key, value) {
    var without = this.remove(key), content = without.content.slice()
    var found = without.find(place)
    content.splice(found == -1 ? content.length : found, 0, key, value)
    return new OrderedMap(content)
  },

  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(f) {
    for (var i = 0; i < this.content.length; i += 2)
      f(this.content[i], this.content[i + 1])
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(map) {
    map = OrderedMap.from(map)
    if (!map.size) return this
    return new OrderedMap(map.content.concat(this.subtract(map).content))
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(map) {
    map = OrderedMap.from(map)
    if (!map.size) return this
    return new OrderedMap(this.subtract(map).content.concat(map.content))
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(map) {
    var result = this
    map = OrderedMap.from(map)
    for (var i = 0; i < map.content.length; i += 2)
      result = result.remove(map.content[i])
    return result
  },

  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1
  }
}

// :: (?union<Object, OrderedMap>) → OrderedMap
// Return a map with the given content. If null, create an empty
// map. If given an ordered map, return that map itself. If given an
// object, create a map from the object's properties.
OrderedMap.from = function(value) {
  if (value instanceof OrderedMap) return value
  var content = []
  if (value) for (var prop in value) content.push(prop, value[prop])
  return new OrderedMap(content)
}

module.exports = OrderedMap

},{}],"../node_modules/prosemirror-model/dist/index.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var OrderedMap = _interopDefault(require('orderedmap'));

function findDiffStart(a, b, pos) {
  for (var i = 0;; i++) {
    if (i == a.childCount || i == b.childCount)
      { return a.childCount == b.childCount ? null : pos }

    var childA = a.child(i), childB = b.child(i);
    if (childA == childB) { pos += childA.nodeSize; continue }

    if (!childA.sameMarkup(childB)) { return pos }

    if (childA.isText && childA.text != childB.text) {
      for (var j = 0; childA.text[j] == childB.text[j]; j++)
        { pos++; }
      return pos
    }
    if (childA.content.size || childB.content.size) {
      var inner = findDiffStart(childA.content, childB.content, pos + 1);
      if (inner != null) { return inner }
    }
    pos += childA.nodeSize;
  }
}

function findDiffEnd(a, b, posA, posB) {
  for (var iA = a.childCount, iB = b.childCount;;) {
    if (iA == 0 || iB == 0)
      { return iA == iB ? null : {a: posA, b: posB} }

    var childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize;
    if (childA == childB) {
      posA -= size; posB -= size;
      continue
    }

    if (!childA.sameMarkup(childB)) { return {a: posA, b: posB} }

    if (childA.isText && childA.text != childB.text) {
      var same = 0, minSize = Math.min(childA.text.length, childB.text.length);
      while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
        same++; posA--; posB--;
      }
      return {a: posA, b: posB}
    }
    if (childA.content.size || childB.content.size) {
      var inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1);
      if (inner) { return inner }
    }
    posA -= size; posB -= size;
  }
}

// ::- A fragment represents a node's collection of child nodes.
//
// Like nodes, fragments are persistent data structures, and you
// should not mutate them or their content. Rather, you create new
// instances whenever needed. The API tries to make this easy.
var Fragment = function Fragment(content, size) {
  var this$1 = this;

  this.content = content;
  // :: number
  // The size of the fragment, which is the total of the size of its
  // content nodes.
  this.size = size || 0;
  if (size == null) { for (var i = 0; i < content.length; i++)
    { this$1.size += content[i].nodeSize; } }
};

var prototypeAccessors$1 = { firstChild: {},lastChild: {},childCount: {} };

// :: (number, number, (node: Node, start: number, parent: Node, index: number) → ?bool, ?number)
// Invoke a callback for all descendant nodes between the given two
// positions (relative to start of this fragment). Doesn't descend
// into a node when the callback returns `false`.
Fragment.prototype.nodesBetween = function nodesBetween (from, to, f, nodeStart, parent) {
    var this$1 = this;
    if ( nodeStart === void 0 ) nodeStart = 0;

  for (var i = 0, pos = 0; pos < to; i++) {
    var child = this$1.content[i], end = pos + child.nodeSize;
    if (end > from && f(child, nodeStart + pos, parent, i) !== false && child.content.size) {
      var start = pos + 1;
      child.nodesBetween(Math.max(0, from - start),
                         Math.min(child.content.size, to - start),
                         f, nodeStart + start);
    }
    pos = end;
  }
};

// :: ((node: Node, pos: number, parent: Node) → ?bool)
// Call the given callback for every descendant node. The callback
// may return `false` to prevent traversal of a given node's children.
Fragment.prototype.descendants = function descendants (f) {
  this.nodesBetween(0, this.size, f);
};

// : (number, number, ?string, ?string) → string
Fragment.prototype.textBetween = function textBetween (from, to, blockSeparator, leafText) {
  var text = "", separated = true;
  this.nodesBetween(from, to, function (node, pos) {
    if (node.isText) {
      text += node.text.slice(Math.max(from, pos) - pos, to - pos);
      separated = !blockSeparator;
    } else if (node.isLeaf && leafText) {
      text += leafText;
      separated = !blockSeparator;
    } else if (!separated && node.isBlock) {
      text += blockSeparator;
      separated = true;
    }
  }, 0);
  return text
};

// :: (Fragment) → Fragment
// Create a new fragment containing the combined content of this
// fragment and the other.
Fragment.prototype.append = function append (other) {
  if (!other.size) { return this }
  if (!this.size) { return other }
  var last = this.lastChild, first = other.firstChild, content = this.content.slice(), i = 0;
  if (last.isText && last.sameMarkup(first)) {
    content[content.length - 1] = last.withText(last.text + first.text);
    i = 1;
  }
  for (; i < other.content.length; i++) { content.push(other.content[i]); }
  return new Fragment(content, this.size + other.size)
};

// :: (number, ?number) → Fragment
// Cut out the sub-fragment between the two given positions.
Fragment.prototype.cut = function cut (from, to) {
    var this$1 = this;

  if (to == null) { to = this.size; }
  if (from == 0 && to == this.size) { return this }
  var result = [], size = 0;
  if (to > from) { for (var i = 0, pos = 0; pos < to; i++) {
    var child = this$1.content[i], end = pos + child.nodeSize;
    if (end > from) {
      if (pos < from || end > to) {
        if (child.isText)
          { child = child.cut(Math.max(0, from - pos), Math.min(child.text.length, to - pos)); }
        else
          { child = child.cut(Math.max(0, from - pos - 1), Math.min(child.content.size, to - pos - 1)); }
      }
      result.push(child);
      size += child.nodeSize;
    }
    pos = end;
  } }
  return new Fragment(result, size)
};

Fragment.prototype.cutByIndex = function cutByIndex (from, to) {
  if (from == to) { return Fragment.empty }
  if (from == 0 && to == this.content.length) { return this }
  return new Fragment(this.content.slice(from, to))
};

// :: (number, Node) → Fragment
// Create a new fragment in which the node at the given index is
// replaced by the given node.
Fragment.prototype.replaceChild = function replaceChild (index, node) {
  var current = this.content[index];
  if (current == node) { return this }
  var copy = this.content.slice();
  var size = this.size + node.nodeSize - current.nodeSize;
  copy[index] = node;
  return new Fragment(copy, size)
};

// : (Node) → Fragment
// Create a new fragment by prepending the given node to this
// fragment.
Fragment.prototype.addToStart = function addToStart (node) {
  return new Fragment([node].concat(this.content), this.size + node.nodeSize)
};

// : (Node) → Fragment
// Create a new fragment by appending the given node to this
// fragment.
Fragment.prototype.addToEnd = function addToEnd (node) {
  return new Fragment(this.content.concat(node), this.size + node.nodeSize)
};

// :: (Fragment) → bool
// Compare this fragment to another one.
Fragment.prototype.eq = function eq (other) {
    var this$1 = this;

  if (this.content.length != other.content.length) { return false }
  for (var i = 0; i < this.content.length; i++)
    { if (!this$1.content[i].eq(other.content[i])) { return false } }
  return true
};

// :: ?Node
// The first child of the fragment, or `null` if it is empty.
prototypeAccessors$1.firstChild.get = function () { return this.content.length ? this.content[0] : null };

// :: ?Node
// The last child of the fragment, or `null` if it is empty.
prototypeAccessors$1.lastChild.get = function () { return this.content.length ? this.content[this.content.length - 1] : null };

// :: number
// The number of child nodes in this fragment.
prototypeAccessors$1.childCount.get = function () { return this.content.length };

// :: (number) → Node
// Get the child node at the given index. Raise an error when the
// index is out of range.
Fragment.prototype.child = function child (index) {
  var found = this.content[index];
  if (!found) { throw new RangeError("Index " + index + " out of range for " + this) }
  return found
};

// :: (number) → ?Node
// Get the child node at the given index, if it exists.
Fragment.prototype.maybeChild = function maybeChild (index) {
  return this.content[index]
};

// :: ((node: Node, offset: number, index: number))
// Call `f` for every child node, passing the node, its offset
// into this parent node, and its index.
Fragment.prototype.forEach = function forEach (f) {
    var this$1 = this;

  for (var i = 0, p = 0; i < this.content.length; i++) {
    var child = this$1.content[i];
    f(child, p, i);
    p += child.nodeSize;
  }
};

// :: (Fragment) → ?number
// Find the first position at which this fragment and another
// fragment differ, or `null` if they are the same.
Fragment.prototype.findDiffStart = function findDiffStart$1 (other, pos) {
    if ( pos === void 0 ) pos = 0;

  return findDiffStart(this, other, pos)
};

// :: (Fragment) → ?{a: number, b: number}
// Find the first position, searching from the end, at which this
// fragment and the given fragment differ, or `null` if they are the
// same. Since this position will not be the same in both nodes, an
// object with two separate positions is returned.
Fragment.prototype.findDiffEnd = function findDiffEnd$1 (other, pos, otherPos) {
    if ( pos === void 0 ) pos = this.size;
    if ( otherPos === void 0 ) otherPos = other.size;

  return findDiffEnd(this, other, pos, otherPos)
};

// : (number, ?number) → {index: number, offset: number}
// Find the index and inner offset corresponding to a given relative
// position in this fragment. The result object will be reused
// (overwritten) the next time the function is called. (Not public.)
Fragment.prototype.findIndex = function findIndex (pos, round) {
    var this$1 = this;
    if ( round === void 0 ) round = -1;

  if (pos == 0) { return retIndex(0, pos) }
  if (pos == this.size) { return retIndex(this.content.length, pos) }
  if (pos > this.size || pos < 0) { throw new RangeError(("Position " + pos + " outside of fragment (" + (this) + ")")) }
  for (var i = 0, curPos = 0;; i++) {
    var cur = this$1.child(i), end = curPos + cur.nodeSize;
    if (end >= pos) {
      if (end == pos || round > 0) { return retIndex(i + 1, end) }
      return retIndex(i, curPos)
    }
    curPos = end;
  }
};

// :: () → string
// Return a debugging string that describes this fragment.
Fragment.prototype.toString = function toString () { return "<" + this.toStringInner() + ">" };

Fragment.prototype.toStringInner = function toStringInner () { return this.content.join(", ") };

// :: () → ?Object
// Create a JSON-serializeable representation of this fragment.
Fragment.prototype.toJSON = function toJSON () {
  return this.content.length ? this.content.map(function (n) { return n.toJSON(); }) : null
};

// :: (Schema, ?Object) → Fragment
// Deserialize a fragment from its JSON representation.
Fragment.fromJSON = function fromJSON (schema, value) {
  if (!value) { return Fragment.empty }
  if (!Array.isArray(value)) { throw new RangeError("Invalid input for Fragment.fromJSON") }
  return new Fragment(value.map(schema.nodeFromJSON))
};

// :: ([Node]) → Fragment
// Build a fragment from an array of nodes. Ensures that adjacent
// text nodes with the same marks are joined together.
Fragment.fromArray = function fromArray (array) {
  if (!array.length) { return Fragment.empty }
  var joined, size = 0;
  for (var i = 0; i < array.length; i++) {
    var node = array[i];
    size += node.nodeSize;
    if (i && node.isText && array[i - 1].sameMarkup(node)) {
      if (!joined) { joined = array.slice(0, i); }
      joined[joined.length - 1] = node.withText(joined[joined.length - 1].text + node.text);
    } else if (joined) {
      joined.push(node);
    }
  }
  return new Fragment(joined || array, size)
};

// :: (?union<Fragment, Node, [Node]>) → Fragment
// Create a fragment from something that can be interpreted as a set
// of nodes. For `null`, it returns the empty fragment. For a
// fragment, the fragment itself. For a node or array of nodes, a
// fragment containing those nodes.
Fragment.from = function from (nodes) {
  if (!nodes) { return Fragment.empty }
  if (nodes instanceof Fragment) { return nodes }
  if (Array.isArray(nodes)) { return this.fromArray(nodes) }
  if (nodes.attrs) { return new Fragment([nodes], nodes.nodeSize) }
  throw new RangeError("Can not convert " + nodes + " to a Fragment" +
                       (nodes.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""))
};

Object.defineProperties( Fragment.prototype, prototypeAccessors$1 );

var found = {index: 0, offset: 0};
function retIndex(index, offset) {
  found.index = index;
  found.offset = offset;
  return found
}

// :: Fragment
// An empty fragment. Intended to be reused whenever a node doesn't
// contain anything (rather than allocating a new empty fragment for
// each leaf node).
Fragment.empty = new Fragment([], 0);

function compareDeep(a, b) {
  if (a === b) { return true }
  if (!(a && typeof a == "object") ||
      !(b && typeof b == "object")) { return false }
  var array = Array.isArray(a);
  if (Array.isArray(b) != array) { return false }
  if (array) {
    if (a.length != b.length) { return false }
    for (var i = 0; i < a.length; i++) { if (!compareDeep(a[i], b[i])) { return false } }
  } else {
    for (var p in a) { if (!(p in b) || !compareDeep(a[p], b[p])) { return false } }
    for (var p$1 in b) { if (!(p$1 in a)) { return false } }
  }
  return true
}

// ::- A mark is a piece of information that can be attached to a node,
// such as it being emphasized, in code font, or a link. It has a type
// and optionally a set of attributes that provide further information
// (such as the target of the link). Marks are created through a
// `Schema`, which controls which types exist and which
// attributes they have.
var Mark = function Mark(type, attrs) {
  // :: MarkType
  // The type of this mark.
  this.type = type;
  // :: Object
  // The attributes associated with this mark.
  this.attrs = attrs;
};

// :: ([Mark]) → [Mark]
// Given a set of marks, create a new set which contains this one as
// well, in the right position. If this mark is already in the set,
// the set itself is returned. If any marks that are set to be
// [exclusive](#model.MarkSpec.excludes) with this mark are present,
// those are replaced by this one.
Mark.prototype.addToSet = function addToSet (set) {
    var this$1 = this;

  var copy, placed = false;
  for (var i = 0; i < set.length; i++) {
    var other = set[i];
    if (this$1.eq(other)) { return set }
    if (this$1.type.excludes(other.type)) {
      if (!copy) { copy = set.slice(0, i); }
    } else if (other.type.excludes(this$1.type)) {
      return set
    } else {
      if (!placed && other.type.rank > this$1.type.rank) {
        if (!copy) { copy = set.slice(0, i); }
        copy.push(this$1);
        placed = true;
      }
      if (copy) { copy.push(other); }
    }
  }
  if (!copy) { copy = set.slice(); }
  if (!placed) { copy.push(this); }
  return copy
};

// :: ([Mark]) → [Mark]
// Remove this mark from the given set, returning a new set. If this
// mark is not in the set, the set itself is returned.
Mark.prototype.removeFromSet = function removeFromSet (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (this$1.eq(set[i]))
      { return set.slice(0, i).concat(set.slice(i + 1)) } }
  return set
};

// :: ([Mark]) → bool
// Test whether this mark is in the given set of marks.
Mark.prototype.isInSet = function isInSet (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (this$1.eq(set[i])) { return true } }
  return false
};

// :: (Mark) → bool
// Test whether this mark has the same type and attributes as
// another mark.
Mark.prototype.eq = function eq (other) {
  return this == other ||
    (this.type == other.type && compareDeep(this.attrs, other.attrs))
};

// :: () → Object
// Convert this mark to a JSON-serializeable representation.
Mark.prototype.toJSON = function toJSON () {
    var this$1 = this;

  var obj = {type: this.type.name};
  for (var _ in this$1.attrs) {
    obj.attrs = this$1.attrs;
    break
  }
  return obj
};

// :: (Schema, Object) → Mark
Mark.fromJSON = function fromJSON (schema, json) {
  if (!json) { throw new RangeError("Invalid input for Mark.fromJSON") }
  var type = schema.marks[json.type];
  if (!type) { throw new RangeError(("There is no mark type " + (json.type) + " in this schema")) }
  return type.create(json.attrs)
};

// :: ([Mark], [Mark]) → bool
// Test whether two sets of marks are identical.
Mark.sameSet = function sameSet (a, b) {
  if (a == b) { return true }
  if (a.length != b.length) { return false }
  for (var i = 0; i < a.length; i++)
    { if (!a[i].eq(b[i])) { return false } }
  return true
};

// :: (?union<Mark, [Mark]>) → [Mark]
// Create a properly sorted mark set from null, a single mark, or an
// unsorted array of marks.
Mark.setFrom = function setFrom (marks) {
  if (!marks || marks.length == 0) { return Mark.none }
  if (marks instanceof Mark) { return [marks] }
  var copy = marks.slice();
  copy.sort(function (a, b) { return a.type.rank - b.type.rank; });
  return copy
};

// :: [Mark] The empty set of marks.
Mark.none = [];

// ReplaceError:: class extends Error
// Error type raised by [`Node.replace`](#model.Node.replace) when
// given an invalid replacement.

function ReplaceError(message) {
  var err = Error.call(this, message);
  err.__proto__ = ReplaceError.prototype;
  return err
}

ReplaceError.prototype = Object.create(Error.prototype);
ReplaceError.prototype.constructor = ReplaceError;
ReplaceError.prototype.name = "ReplaceError";

// ::- A slice represents a piece cut out of a larger document. It
// stores not only a fragment, but also the depth up to which nodes on
// both side are ‘open’ (cut through).
var Slice = function Slice(content, openStart, openEnd) {
  // :: Fragment The slice's content.
  this.content = content;
  // :: number The open depth at the start.
  this.openStart = openStart;
  // :: number The open depth at the end.
  this.openEnd = openEnd;
};

var prototypeAccessors$2 = { size: {} };

// :: number
// The size this slice would add when inserted into a document.
prototypeAccessors$2.size.get = function () {
  return this.content.size - this.openStart - this.openEnd
};

Slice.prototype.insertAt = function insertAt (pos, fragment) {
  var content = insertInto(this.content, pos + this.openStart, fragment, null);
  return content && new Slice(content, this.openStart, this.openEnd)
};

Slice.prototype.removeBetween = function removeBetween (from, to) {
  return new Slice(removeRange(this.content, from + this.openStart, to + this.openStart), this.openStart, this.openEnd)
};

// :: (Slice) → bool
// Tests whether this slice is equal to another slice.
Slice.prototype.eq = function eq (other) {
  return this.content.eq(other.content) && this.openStart == other.openStart && this.openEnd == other.openEnd
};

Slice.prototype.toString = function toString () {
  return this.content + "(" + this.openStart + "," + this.openEnd + ")"
};

// :: () → ?Object
// Convert a slice to a JSON-serializable representation.
Slice.prototype.toJSON = function toJSON () {
  if (!this.content.size) { return null }
  var json = {content: this.content.toJSON()};
  if (this.openStart > 0) { json.openStart = this.openStart; }
  if (this.openEnd > 0) { json.openEnd = this.openEnd; }
  return json
};

// :: (Schema, ?Object) → Slice
// Deserialize a slice from its JSON representation.
Slice.fromJSON = function fromJSON (schema, json) {
  if (!json) { return Slice.empty }
  var openStart = json.openStart || 0, openEnd = json.openEnd || 0;
  if (typeof openStart != "number" || typeof openEnd != "number")
    { throw new RangeError("Invalid input for Slice.fromJSON") }
  return new Slice(Fragment.fromJSON(schema, json.content), json.openStart || 0, json.openEnd || 0)
};

// :: (Fragment, ?bool) → Slice
// Create a slice from a fragment by taking the maximum possible
// open value on both side of the fragment.
Slice.maxOpen = function maxOpen (fragment, openIsolating) {
    if ( openIsolating === void 0 ) openIsolating=true;

  var openStart = 0, openEnd = 0;
  for (var n = fragment.firstChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.firstChild) { openStart++; }
  for (var n$1 = fragment.lastChild; n$1 && !n$1.isLeaf && (openIsolating || !n$1.type.spec.isolating); n$1 = n$1.lastChild) { openEnd++; }
  return new Slice(fragment, openStart, openEnd)
};

Object.defineProperties( Slice.prototype, prototypeAccessors$2 );

function removeRange(content, from, to) {
  var ref = content.findIndex(from);
  var index = ref.index;
  var offset = ref.offset;
  var child = content.maybeChild(index);
  var ref$1 = content.findIndex(to);
  var indexTo = ref$1.index;
  var offsetTo = ref$1.offset;
  if (offset == from || child.isText) {
    if (offsetTo != to && !content.child(indexTo).isText) { throw new RangeError("Removing non-flat range") }
    return content.cut(0, from).append(content.cut(to))
  }
  if (index != indexTo) { throw new RangeError("Removing non-flat range") }
  return content.replaceChild(index, child.copy(removeRange(child.content, from - offset - 1, to - offset - 1)))
}

function insertInto(content, dist, insert, parent) {
  var ref = content.findIndex(dist);
  var index = ref.index;
  var offset = ref.offset;
  var child = content.maybeChild(index);
  if (offset == dist || child.isText) {
    if (parent && !parent.canReplace(index, index, insert)) { return null }
    return content.cut(0, dist).append(insert).append(content.cut(dist))
  }
  var inner = insertInto(child.content, dist - offset - 1, insert);
  return inner && content.replaceChild(index, child.copy(inner))
}

// :: Slice
// The empty slice.
Slice.empty = new Slice(Fragment.empty, 0, 0);

function replace($from, $to, slice) {
  if (slice.openStart > $from.depth)
    { throw new ReplaceError("Inserted content deeper than insertion position") }
  if ($from.depth - slice.openStart != $to.depth - slice.openEnd)
    { throw new ReplaceError("Inconsistent open depths") }
  return replaceOuter($from, $to, slice, 0)
}

function replaceOuter($from, $to, slice, depth) {
  var index = $from.index(depth), node = $from.node(depth);
  if (index == $to.index(depth) && depth < $from.depth - slice.openStart) {
    var inner = replaceOuter($from, $to, slice, depth + 1);
    return node.copy(node.content.replaceChild(index, inner))
  } else if (!slice.content.size) {
    return close(node, replaceTwoWay($from, $to, depth))
  } else if (!slice.openStart && !slice.openEnd && $from.depth == depth && $to.depth == depth) { // Simple, flat case
    var parent = $from.parent, content = parent.content;
    return close(parent, content.cut(0, $from.parentOffset).append(slice.content).append(content.cut($to.parentOffset)))
  } else {
    var ref = prepareSliceForReplace(slice, $from);
    var start = ref.start;
    var end = ref.end;
    return close(node, replaceThreeWay($from, start, end, $to, depth))
  }
}

function checkJoin(main, sub) {
  if (!sub.type.compatibleContent(main.type))
    { throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main.type.name) }
}

function joinable($before, $after, depth) {
  var node = $before.node(depth);
  checkJoin(node, $after.node(depth));
  return node
}

function addNode(child, target) {
  var last = target.length - 1;
  if (last >= 0 && child.isText && child.sameMarkup(target[last]))
    { target[last] = child.withText(target[last].text + child.text); }
  else
    { target.push(child); }
}

function addRange($start, $end, depth, target) {
  var node = ($end || $start).node(depth);
  var startIndex = 0, endIndex = $end ? $end.index(depth) : node.childCount;
  if ($start) {
    startIndex = $start.index(depth);
    if ($start.depth > depth) {
      startIndex++;
    } else if ($start.textOffset) {
      addNode($start.nodeAfter, target);
      startIndex++;
    }
  }
  for (var i = startIndex; i < endIndex; i++) { addNode(node.child(i), target); }
  if ($end && $end.depth == depth && $end.textOffset)
    { addNode($end.nodeBefore, target); }
}

function close(node, content) {
  if (!node.type.validContent(content))
    { throw new ReplaceError("Invalid content for node " + node.type.name) }
  return node.copy(content)
}

function replaceThreeWay($from, $start, $end, $to, depth) {
  var openStart = $from.depth > depth && joinable($from, $start, depth + 1);
  var openEnd = $to.depth > depth && joinable($end, $to, depth + 1);

  var content = [];
  addRange(null, $from, depth, content);
  if (openStart && openEnd && $start.index(depth) == $end.index(depth)) {
    checkJoin(openStart, openEnd);
    addNode(close(openStart, replaceThreeWay($from, $start, $end, $to, depth + 1)), content);
  } else {
    if (openStart)
      { addNode(close(openStart, replaceTwoWay($from, $start, depth + 1)), content); }
    addRange($start, $end, depth, content);
    if (openEnd)
      { addNode(close(openEnd, replaceTwoWay($end, $to, depth + 1)), content); }
  }
  addRange($to, null, depth, content);
  return new Fragment(content)
}

function replaceTwoWay($from, $to, depth) {
  var content = [];
  addRange(null, $from, depth, content);
  if ($from.depth > depth) {
    var type = joinable($from, $to, depth + 1);
    addNode(close(type, replaceTwoWay($from, $to, depth + 1)), content);
  }
  addRange($to, null, depth, content);
  return new Fragment(content)
}

function prepareSliceForReplace(slice, $along) {
  var extra = $along.depth - slice.openStart, parent = $along.node(extra);
  var node = parent.copy(slice.content);
  for (var i = extra - 1; i >= 0; i--)
    { node = $along.node(i).copy(Fragment.from(node)); }
  return {start: node.resolveNoCache(slice.openStart + extra),
          end: node.resolveNoCache(node.content.size - slice.openEnd - extra)}
}

// ::- You can [_resolve_](#model.Node.resolve) a position to get more
// information about it. Objects of this class represent such a
// resolved position, providing various pieces of context information,
// and some helper methods.
//
// Throughout this interface, methods that take an optional `depth`
// parameter will interpret undefined as `this.depth` and negative
// numbers as `this.depth + value`.
var ResolvedPos = function ResolvedPos(pos, path, parentOffset) {
  // :: number The position that was resolved.
  this.pos = pos;
  this.path = path;
  // :: number
  // The number of levels the parent node is from the root. If this
  // position points directly into the root node, it is 0. If it
  // points into a top-level paragraph, 1, and so on.
  this.depth = path.length / 3 - 1;
  // :: number The offset this position has into its parent node.
  this.parentOffset = parentOffset;
};

var prototypeAccessors$3 = { parent: {},doc: {},textOffset: {},nodeAfter: {},nodeBefore: {} };

ResolvedPos.prototype.resolveDepth = function resolveDepth (val) {
  if (val == null) { return this.depth }
  if (val < 0) { return this.depth + val }
  return val
};

// :: Node
// The parent node that the position points into. Note that even if
// a position points into a text node, that node is not considered
// the parent—text nodes are ‘flat’ in this model, and have no content.
prototypeAccessors$3.parent.get = function () { return this.node(this.depth) };

// :: Node
// The root node in which the position was resolved.
prototypeAccessors$3.doc.get = function () { return this.node(0) };

// :: (?number) → Node
// The ancestor node at the given level. `p.node(p.depth)` is the
// same as `p.parent`.
ResolvedPos.prototype.node = function node (depth) { return this.path[this.resolveDepth(depth) * 3] };

// :: (?number) → number
// The index into the ancestor at the given level. If this points at
// the 3rd node in the 2nd paragraph on the top level, for example,
// `p.index(0)` is 2 and `p.index(1)` is 3.
ResolvedPos.prototype.index = function index (depth) { return this.path[this.resolveDepth(depth) * 3 + 1] };

// :: (?number) → number
// The index pointing after this position into the ancestor at the
// given level.
ResolvedPos.prototype.indexAfter = function indexAfter (depth) {
  depth = this.resolveDepth(depth);
  return this.index(depth) + (depth == this.depth && !this.textOffset ? 0 : 1)
};

// :: (?number) → number
// The (absolute) position at the start of the node at the given
// level.
ResolvedPos.prototype.start = function start (depth) {
  depth = this.resolveDepth(depth);
  return depth == 0 ? 0 : this.path[depth * 3 - 1] + 1
};

// :: (?number) → number
// The (absolute) position at the end of the node at the given
// level.
ResolvedPos.prototype.end = function end (depth) {
  depth = this.resolveDepth(depth);
  return this.start(depth) + this.node(depth).content.size
};

// :: (?number) → number
// The (absolute) position directly before the wrapping node at the
// given level, or, when `level` is `this.depth + 1`, the original
// position.
ResolvedPos.prototype.before = function before (depth) {
  depth = this.resolveDepth(depth);
  if (!depth) { throw new RangeError("There is no position before the top-level node") }
  return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1]
};

// :: (?number) → number
// The (absolute) position directly after the wrapping node at the
// given level, or the original position when `level` is `this.depth + 1`.
ResolvedPos.prototype.after = function after (depth) {
  depth = this.resolveDepth(depth);
  if (!depth) { throw new RangeError("There is no position after the top-level node") }
  return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1] + this.path[depth * 3].nodeSize
};

// :: number
// When this position points into a text node, this returns the
// distance between the position and the start of the text node.
// Will be zero for positions that point between nodes.
prototypeAccessors$3.textOffset.get = function () { return this.pos - this.path[this.path.length - 1] };

// :: ?Node
// Get the node directly after the position, if any. If the position
// points into a text node, only the part of that node after the
// position is returned.
prototypeAccessors$3.nodeAfter.get = function () {
  var parent = this.parent, index = this.index(this.depth);
  if (index == parent.childCount) { return null }
  var dOff = this.pos - this.path[this.path.length - 1], child = parent.child(index);
  return dOff ? parent.child(index).cut(dOff) : child
};

// :: ?Node
// Get the node directly before the position, if any. If the
// position points into a text node, only the part of that node
// before the position is returned.
prototypeAccessors$3.nodeBefore.get = function () {
  var index = this.index(this.depth);
  var dOff = this.pos - this.path[this.path.length - 1];
  if (dOff) { return this.parent.child(index).cut(0, dOff) }
  return index == 0 ? null : this.parent.child(index - 1)
};

// :: () → [Mark]
// Get the marks at this position, factoring in the surrounding
// marks' [`inclusive`](#model.MarkSpec.inclusive) property. If the
// position is at the start of a non-empty node, the marks of the
// node after it (if any) are returned.
ResolvedPos.prototype.marks = function marks () {
  var parent = this.parent, index = this.index();

  // In an empty parent, return the empty array
  if (parent.content.size == 0) { return Mark.none }

  // When inside a text node, just return the text node's marks
  if (this.textOffset) { return parent.child(index).marks }

  var main = parent.maybeChild(index - 1), other = parent.maybeChild(index);
  // If the `after` flag is true of there is no node before, make
  // the node after this position the main reference.
  if (!main) { var tmp = main; main = other; other = tmp; }

  // Use all marks in the main node, except those that have
  // `inclusive` set to false and are not present in the other node.
  var marks = main.marks;
  for (var i = 0; i < marks.length; i++)
    { if (marks[i].type.spec.inclusive === false && (!other || !marks[i].isInSet(other.marks)))
      { marks = marks[i--].removeFromSet(marks); } }

  return marks
};

// :: (ResolvedPos) → ?[Mark]
// Get the marks after the current position, if any, except those
// that are non-inclusive and not present at position `$end`. This
// is mostly useful for getting the set of marks to preserve after a
// deletion. Will return `null` if this position is at the end of
// its parent node or its parent node isn't a textblock (in which
// case no marks should be preserved).
ResolvedPos.prototype.marksAcross = function marksAcross ($end) {
  var after = this.parent.maybeChild(this.index());
  if (!after || !after.isInline) { return null }

  var marks = after.marks, next = $end.parent.maybeChild($end.index());
  for (var i = 0; i < marks.length; i++)
    { if (marks[i].type.spec.inclusive === false && (!next || !marks[i].isInSet(next.marks)))
      { marks = marks[i--].removeFromSet(marks); } }
  return marks
};

// :: (number) → number
// The depth up to which this position and the given (non-resolved)
// position share the same parent nodes.
ResolvedPos.prototype.sharedDepth = function sharedDepth (pos) {
    var this$1 = this;

  for (var depth = this.depth; depth > 0; depth--)
    { if (this$1.start(depth) <= pos && this$1.end(depth) >= pos) { return depth } }
  return 0
};

// :: (?ResolvedPos, ?(Node) → bool) → ?NodeRange
// Returns a range based on the place where this position and the
// given position diverge around block content. If both point into
// the same textblock, for example, a range around that textblock
// will be returned. If they point into different blocks, the range
// around those blocks in their shared ancestor is returned. You can
// pass in an optional predicate that will be called with a parent
// node to see if a range into that parent is acceptable.
ResolvedPos.prototype.blockRange = function blockRange (other, pred) {
    var this$1 = this;
    if ( other === void 0 ) other = this;

  if (other.pos < this.pos) { return other.blockRange(this) }
  for (var d = this.depth - (this.parent.inlineContent || this.pos == other.pos ? 1 : 0); d >= 0; d--)
    { if (other.pos <= this$1.end(d) && (!pred || pred(this$1.node(d))))
      { return new NodeRange(this$1, other, d) } }
};

// :: (ResolvedPos) → bool
// Query whether the given position shares the same parent node.
ResolvedPos.prototype.sameParent = function sameParent (other) {
  return this.pos - this.parentOffset == other.pos - other.parentOffset
};

// :: (ResolvedPos) → ResolvedPos
// Return the greater of this and the given position.
ResolvedPos.prototype.max = function max (other) {
  return other.pos > this.pos ? other : this
};

// :: (ResolvedPos) → ResolvedPos
// Return the smaller of this and the given position.
ResolvedPos.prototype.min = function min (other) {
  return other.pos < this.pos ? other : this
};

ResolvedPos.prototype.toString = function toString () {
    var this$1 = this;

  var str = "";
  for (var i = 1; i <= this.depth; i++)
    { str += (str ? "/" : "") + this$1.node(i).type.name + "_" + this$1.index(i - 1); }
  return str + ":" + this.parentOffset
};

ResolvedPos.resolve = function resolve (doc, pos) {
  if (!(pos >= 0 && pos <= doc.content.size)) { throw new RangeError("Position " + pos + " out of range") }
  var path = [];
  var start = 0, parentOffset = pos;
  for (var node = doc;;) {
    var ref = node.content.findIndex(parentOffset);
      var index = ref.index;
      var offset = ref.offset;
    var rem = parentOffset - offset;
    path.push(node, index, start + offset);
    if (!rem) { break }
    node = node.child(index);
    if (node.isText) { break }
    parentOffset = rem - 1;
    start += offset + 1;
  }
  return new ResolvedPos(pos, path, parentOffset)
};

ResolvedPos.resolveCached = function resolveCached (doc, pos) {
  for (var i = 0; i < resolveCache.length; i++) {
    var cached = resolveCache[i];
    if (cached.pos == pos && cached.doc == doc) { return cached }
  }
  var result = resolveCache[resolveCachePos] = ResolvedPos.resolve(doc, pos);
  resolveCachePos = (resolveCachePos + 1) % resolveCacheSize;
  return result
};

Object.defineProperties( ResolvedPos.prototype, prototypeAccessors$3 );

var resolveCache = [];
var resolveCachePos = 0;
var resolveCacheSize = 12;

// ::- Represents a flat range of content, i.e. one that starts and
// ends in the same node.
var NodeRange = function NodeRange($from, $to, depth) {
  // :: ResolvedPos A resolved position along the start of the
  // content. May have a `depth` greater than this object's `depth`
  // property, since these are the positions that were used to
  // compute the range, not re-resolved positions directly at its
  // boundaries.
  this.$from = $from;
  // :: ResolvedPos A position along the end of the content. See
  // caveat for [`$from`](#model.NodeRange.$from).
  this.$to = $to;
  // :: number The depth of the node that this range points into.
  this.depth = depth;
};

var prototypeAccessors$1$1 = { start: {},end: {},parent: {},startIndex: {},endIndex: {} };

// :: number The position at the start of the range.
prototypeAccessors$1$1.start.get = function () { return this.$from.before(this.depth + 1) };
// :: number The position at the end of the range.
prototypeAccessors$1$1.end.get = function () { return this.$to.after(this.depth + 1) };

// :: Node The parent node that the range points into.
prototypeAccessors$1$1.parent.get = function () { return this.$from.node(this.depth) };
// :: number The start index of the range in the parent node.
prototypeAccessors$1$1.startIndex.get = function () { return this.$from.index(this.depth) };
// :: number The end index of the range in the parent node.
prototypeAccessors$1$1.endIndex.get = function () { return this.$to.indexAfter(this.depth) };

Object.defineProperties( NodeRange.prototype, prototypeAccessors$1$1 );

var emptyAttrs = Object.create(null);

// ::- This class represents a node in the tree that makes up a
// ProseMirror document. So a document is an instance of `Node`, with
// children that are also instances of `Node`.
//
// Nodes are persistent data structures. Instead of changing them, you
// create new ones with the content you want. Old ones keep pointing
// at the old document shape. This is made cheaper by sharing
// structure between the old and new data as much as possible, which a
// tree shape like this (without back pointers) makes easy.
//
// **Do not** directly mutate the properties of a `Node` object. See
// [the guide](/docs/guide/#doc) for more information.
var Node = function Node(type, attrs, content, marks) {
  // :: NodeType
  // The type of node that this is.
  this.type = type;

  // :: Object
  // An object mapping attribute names to values. The kind of
  // attributes allowed and required are
  // [determined](#model.NodeSpec.attrs) by the node type.
  this.attrs = attrs;

  // :: Fragment
  // A container holding the node's children.
  this.content = content || Fragment.empty;

  // :: [Mark]
  // The marks (things like whether it is emphasized or part of a
  // link) applied to this node.
  this.marks = marks || Mark.none;
};

var prototypeAccessors = { nodeSize: {},childCount: {},textContent: {},firstChild: {},lastChild: {},isBlock: {},isTextblock: {},inlineContent: {},isInline: {},isText: {},isLeaf: {},isAtom: {} };

// text:: ?string
// For text nodes, this contains the node's text content.

// :: number
// The size of this node, as defined by the integer-based [indexing
// scheme](/docs/guide/#doc.indexing). For text nodes, this is the
// amount of characters. For other leaf nodes, it is one. For
// non-leaf nodes, it is the size of the content plus two (the start
// and end token).
prototypeAccessors.nodeSize.get = function () { return this.isLeaf ? 1 : 2 + this.content.size };

// :: number
// The number of children that the node has.
prototypeAccessors.childCount.get = function () { return this.content.childCount };

// :: (number) → Node
// Get the child node at the given index. Raises an error when the
// index is out of range.
Node.prototype.child = function child (index) { return this.content.child(index) };

// :: (number) → ?Node
// Get the child node at the given index, if it exists.
Node.prototype.maybeChild = function maybeChild (index) { return this.content.maybeChild(index) };

// :: ((node: Node, offset: number, index: number))
// Call `f` for every child node, passing the node, its offset
// into this parent node, and its index.
Node.prototype.forEach = function forEach (f) { this.content.forEach(f); };

// :: (number, number, (node: Node, pos: number, parent: Node, index: number) → ?bool, ?number)
// Invoke a callback for all descendant nodes recursively between
// the given two positions that are relative to start of this node's
// content. The callback is invoked with the node, its
// parent-relative position, its parent node, and its child index.
// When the callback returns false for a given node, that node's
// children will not be recursed over. The last parameter can be
// used to specify a starting position to count from.
Node.prototype.nodesBetween = function nodesBetween (from, to, f, startPos) {
    if ( startPos === void 0 ) startPos = 0;

  this.content.nodesBetween(from, to, f, startPos, this);
};

// :: ((node: Node, pos: number, parent: Node) → ?bool)
// Call the given callback for every descendant node. Doesn't
// descend into a node when the callback returns `false`.
Node.prototype.descendants = function descendants (f) {
  this.nodesBetween(0, this.content.size, f);
};

// :: string
// Concatenates all the text nodes found in this fragment and its
// children.
prototypeAccessors.textContent.get = function () { return this.textBetween(0, this.content.size, "") };

// :: (number, number, ?string, ?string) → string
// Get all text between positions `from` and `to`. When
// `blockSeparator` is given, it will be inserted whenever a new
// block node is started. When `leafText` is given, it'll be
// inserted for every non-text leaf node encountered.
Node.prototype.textBetween = function textBetween (from, to, blockSeparator, leafText) {
  return this.content.textBetween(from, to, blockSeparator, leafText)
};

// :: ?Node
// Returns this node's first child, or `null` if there are no
// children.
prototypeAccessors.firstChild.get = function () { return this.content.firstChild };

// :: ?Node
// Returns this node's last child, or `null` if there are no
// children.
prototypeAccessors.lastChild.get = function () { return this.content.lastChild };

// :: (Node) → bool
// Test whether two nodes represent the same piece of document.
Node.prototype.eq = function eq (other) {
  return this == other || (this.sameMarkup(other) && this.content.eq(other.content))
};

// :: (Node) → bool
// Compare the markup (type, attributes, and marks) of this node to
// those of another. Returns `true` if both have the same markup.
Node.prototype.sameMarkup = function sameMarkup (other) {
  return this.hasMarkup(other.type, other.attrs, other.marks)
};

// :: (NodeType, ?Object, ?[Mark]) → bool
// Check whether this node's markup correspond to the given type,
// attributes, and marks.
Node.prototype.hasMarkup = function hasMarkup (type, attrs, marks) {
  return this.type == type &&
    compareDeep(this.attrs, attrs || type.defaultAttrs || emptyAttrs) &&
    Mark.sameSet(this.marks, marks || Mark.none)
};

// :: (?Fragment) → Node
// Create a new node with the same markup as this node, containing
// the given content (or empty, if no content is given).
Node.prototype.copy = function copy (content) {
    if ( content === void 0 ) content = null;

  if (content == this.content) { return this }
  return new this.constructor(this.type, this.attrs, content, this.marks)
};

// :: ([Mark]) → Node
// Create a copy of this node, with the given set of marks instead
// of the node's own marks.
Node.prototype.mark = function mark (marks) {
  return marks == this.marks ? this : new this.constructor(this.type, this.attrs, this.content, marks)
};

// :: (number, ?number) → Node
// Create a copy of this node with only the content between the
// given positions. If `to` is not given, it defaults to the end of
// the node.
Node.prototype.cut = function cut (from, to) {
  if (from == 0 && to == this.content.size) { return this }
  return this.copy(this.content.cut(from, to))
};

// :: (number, ?number) → Slice
// Cut out the part of the document between the given positions, and
// return it as a `Slice` object.
Node.prototype.slice = function slice (from, to, includeParents) {
    if ( to === void 0 ) to = this.content.size;
    if ( includeParents === void 0 ) includeParents = false;

  if (from == to) { return Slice.empty }

  var $from = this.resolve(from), $to = this.resolve(to);
  var depth = includeParents ? 0 : $from.sharedDepth(to);
  var start = $from.start(depth), node = $from.node(depth);
  var content = node.content.cut($from.pos - start, $to.pos - start);
  return new Slice(content, $from.depth - depth, $to.depth - depth)
};

// :: (number, number, Slice) → Node
// Replace the part of the document between the given positions with
// the given slice. The slice must 'fit', meaning its open sides
// must be able to connect to the surrounding content, and its
// content nodes must be valid children for the node they are placed
// into. If any of this is violated, an error of type
// [`ReplaceError`](#model.ReplaceError) is thrown.
Node.prototype.replace = function replace$1 (from, to, slice) {
  return replace(this.resolve(from), this.resolve(to), slice)
};

// :: (number) → ?Node
// Find the node directly after the given position.
Node.prototype.nodeAt = function nodeAt (pos) {
  for (var node = this;;) {
    var ref = node.content.findIndex(pos);
      var index = ref.index;
      var offset = ref.offset;
    node = node.maybeChild(index);
    if (!node) { return null }
    if (offset == pos || node.isText) { return node }
    pos -= offset + 1;
  }
};

// :: (number) → {node: ?Node, index: number, offset: number}
// Find the (direct) child node after the given offset, if any,
// and return it along with its index and offset relative to this
// node.
Node.prototype.childAfter = function childAfter (pos) {
  var ref = this.content.findIndex(pos);
    var index = ref.index;
    var offset = ref.offset;
  return {node: this.content.maybeChild(index), index: index, offset: offset}
};

// :: (number) → {node: ?Node, index: number, offset: number}
// Find the (direct) child node before the given offset, if any,
// and return it along with its index and offset relative to this
// node.
Node.prototype.childBefore = function childBefore (pos) {
  if (pos == 0) { return {node: null, index: 0, offset: 0} }
  var ref = this.content.findIndex(pos);
    var index = ref.index;
    var offset = ref.offset;
  if (offset < pos) { return {node: this.content.child(index), index: index, offset: offset} }
  var node = this.content.child(index - 1);
  return {node: node, index: index - 1, offset: offset - node.nodeSize}
};

// :: (number) → ResolvedPos
// Resolve the given position in the document, returning an
// [object](#model.ResolvedPos) with information about its context.
Node.prototype.resolve = function resolve (pos) { return ResolvedPos.resolveCached(this, pos) };

Node.prototype.resolveNoCache = function resolveNoCache (pos) { return ResolvedPos.resolve(this, pos) };

// :: (number, number, MarkType) → bool
// Test whether a mark of the given type occurs in this document
// between the two given positions.
Node.prototype.rangeHasMark = function rangeHasMark (from, to, type) {
  var found = false;
  if (to > from) { this.nodesBetween(from, to, function (node) {
    if (type.isInSet(node.marks)) { found = true; }
    return !found
  }); }
  return found
};

// :: bool
// True when this is a block (non-inline node)
prototypeAccessors.isBlock.get = function () { return this.type.isBlock };

// :: bool
// True when this is a textblock node, a block node with inline
// content.
prototypeAccessors.isTextblock.get = function () { return this.type.isTextblock };

// :: bool
// True when this node allows inline content.
prototypeAccessors.inlineContent.get = function () { return this.type.inlineContent };

// :: bool
// True when this is an inline node (a text node or a node that can
// appear among text).
prototypeAccessors.isInline.get = function () { return this.type.isInline };

// :: bool
// True when this is a text node.
prototypeAccessors.isText.get = function () { return this.type.isText };

// :: bool
// True when this is a leaf node.
prototypeAccessors.isLeaf.get = function () { return this.type.isLeaf };

// :: bool
// True when this is an atom, i.e. when it does not have directly
// editable content. This is usually the same as `isLeaf`, but can
// be configured with the [`atom` property](#model.NodeSpec.atom) on
// a node's spec (typically used when the node is displayed as an
// uneditable [node view](#view.NodeView)).
prototypeAccessors.isAtom.get = function () { return this.type.isAtom };

// :: () → string
// Return a string representation of this node for debugging
// purposes.
Node.prototype.toString = function toString () {
  if (this.type.spec.toDebugString) { return this.type.spec.toDebugString(this) }
  var name = this.type.name;
  if (this.content.size)
    { name += "(" + this.content.toStringInner() + ")"; }
  return wrapMarks(this.marks, name)
};

// :: (number) → ContentMatch
// Get the content match in this node at the given index.
Node.prototype.contentMatchAt = function contentMatchAt (index) {
  var match = this.type.contentMatch.matchFragment(this.content, 0, index);
  if (!match) { throw new Error("Called contentMatchAt on a node with invalid content") }
  return match
};

// :: (number, number, ?Fragment, ?number, ?number) → bool
// Test whether replacing the range between `from` and `to` (by
// child index) with the given replacement fragment (which defaults
// to the empty fragment) would leave the node's content valid. You
// can optionally pass `start` and `end` indices into the
// replacement fragment.
Node.prototype.canReplace = function canReplace (from, to, replacement, start, end) {
    var this$1 = this;
    if ( replacement === void 0 ) replacement = Fragment.empty;
    if ( start === void 0 ) start = 0;
    if ( end === void 0 ) end = replacement.childCount;

  var one = this.contentMatchAt(from).matchFragment(replacement, start, end);
  var two = one && one.matchFragment(this.content, to);
  if (!two || !two.validEnd) { return false }
  for (var i = start; i < end; i++) { if (!this$1.type.allowsMarks(replacement.child(i).marks)) { return false } }
  return true
};

// :: (number, number, NodeType, ?[Mark]) → bool
// Test whether replacing the range `from` to `to` (by index) with a
// node of the given type would leave the node's content valid.
Node.prototype.canReplaceWith = function canReplaceWith (from, to, type, marks) {
  if (marks && !this.type.allowsMarks(marks)) { return false }
  var start = this.contentMatchAt(from).matchType(type);
  var end = start && start.matchFragment(this.content, to);
  return end ? end.validEnd : false
};

// :: (Node) → bool
// Test whether the given node's content could be appended to this
// node. If that node is empty, this will only return true if there
// is at least one node type that can appear in both nodes (to avoid
// merging completely incompatible nodes).
Node.prototype.canAppend = function canAppend (other) {
  if (other.content.size) { return this.canReplace(this.childCount, this.childCount, other.content) }
  else { return this.type.compatibleContent(other.type) }
};

// Unused. Left for backwards compatibility.
Node.prototype.defaultContentType = function defaultContentType (at) {
  return this.contentMatchAt(at).defaultType
};

// :: ()
// Check whether this node and its descendants conform to the
// schema, and raise error when they do not.
Node.prototype.check = function check () {
  if (!this.type.validContent(this.content))
    { throw new RangeError(("Invalid content for node " + (this.type.name) + ": " + (this.content.toString().slice(0, 50)))) }
  this.content.forEach(function (node) { return node.check(); });
};

// :: () → Object
// Return a JSON-serializeable representation of this node.
Node.prototype.toJSON = function toJSON () {
    var this$1 = this;

  var obj = {type: this.type.name};
  for (var _ in this$1.attrs) {
    obj.attrs = this$1.attrs;
    break
  }
  if (this.content.size)
    { obj.content = this.content.toJSON(); }
  if (this.marks.length)
    { obj.marks = this.marks.map(function (n) { return n.toJSON(); }); }
  return obj
};

// :: (Schema, Object) → Node
// Deserialize a node from its JSON representation.
Node.fromJSON = function fromJSON (schema, json) {
  if (!json) { throw new RangeError("Invalid input for Node.fromJSON") }
  var marks = null;
  if (json.marks) {
    if (!Array.isArray(json.marks)) { throw new RangeError("Invalid mark data for Node.fromJSON") }
    marks = json.marks.map(schema.markFromJSON);
  }
  if (json.type == "text") {
    if (typeof json.text != "string") { throw new RangeError("Invalid text node in JSON") }
    return schema.text(json.text, marks)
  }
  var content = Fragment.fromJSON(schema, json.content);
  return schema.nodeType(json.type).create(json.attrs, content, marks)
};

Object.defineProperties( Node.prototype, prototypeAccessors );

var TextNode = (function (Node) {
  function TextNode(type, attrs, content, marks) {
    Node.call(this, type, attrs, null, marks);

    if (!content) { throw new RangeError("Empty text nodes are not allowed") }

    this.text = content;
  }

  if ( Node ) TextNode.__proto__ = Node;
  TextNode.prototype = Object.create( Node && Node.prototype );
  TextNode.prototype.constructor = TextNode;

  var prototypeAccessors$1 = { textContent: {},nodeSize: {} };

  TextNode.prototype.toString = function toString () {
    if (this.type.spec.toDebugString) { return this.type.spec.toDebugString(this) }
    return wrapMarks(this.marks, JSON.stringify(this.text))
  };

  prototypeAccessors$1.textContent.get = function () { return this.text };

  TextNode.prototype.textBetween = function textBetween (from, to) { return this.text.slice(from, to) };

  prototypeAccessors$1.nodeSize.get = function () { return this.text.length };

  TextNode.prototype.mark = function mark (marks) {
    return marks == this.marks ? this : new TextNode(this.type, this.attrs, this.text, marks)
  };

  TextNode.prototype.withText = function withText (text) {
    if (text == this.text) { return this }
    return new TextNode(this.type, this.attrs, text, this.marks)
  };

  TextNode.prototype.cut = function cut (from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.text.length;

    if (from == 0 && to == this.text.length) { return this }
    return this.withText(this.text.slice(from, to))
  };

  TextNode.prototype.eq = function eq (other) {
    return this.sameMarkup(other) && this.text == other.text
  };

  TextNode.prototype.toJSON = function toJSON () {
    var base = Node.prototype.toJSON.call(this);
    base.text = this.text;
    return base
  };

  Object.defineProperties( TextNode.prototype, prototypeAccessors$1 );

  return TextNode;
}(Node));

function wrapMarks(marks, str) {
  for (var i = marks.length - 1; i >= 0; i--)
    { str = marks[i].type.name + "(" + str + ")"; }
  return str
}

// ::- Instances of this class represent a match state of a node
// type's [content expression](#model.NodeSpec.content), and can be
// used to find out whether further content matches here, and whether
// a given position is a valid end of the node.
var ContentMatch = function ContentMatch(validEnd) {
  // :: bool
  // True when this match state represents a valid end of the node.
  this.validEnd = validEnd;
  this.next = [];
  this.wrapCache = [];
};

var prototypeAccessors$5 = { inlineContent: {},defaultType: {},edgeCount: {} };

ContentMatch.parse = function parse (string, nodeTypes) {
  var stream = new TokenStream(string, nodeTypes);
  if (stream.next == null) { return ContentMatch.empty }
  var expr = parseExpr(stream);
  if (stream.next) { stream.err("Unexpected trailing text"); }
  var match = dfa(nfa(expr));
  checkForDeadEnds(match, stream);
  return match
};

// :: (NodeType) → ?ContentMatch
// Match a node type, returning a match after that node if
// successful.
ContentMatch.prototype.matchType = function matchType (type) {
    var this$1 = this;

  for (var i = 0; i < this.next.length; i += 2)
    { if (this$1.next[i] == type) { return this$1.next[i + 1] } }
  return null
};

// :: (Fragment, ?number, ?number) → ?ContentMatch
// Try to match a fragment. Returns the resulting match when
// successful.
ContentMatch.prototype.matchFragment = function matchFragment (frag, start, end) {
    if ( start === void 0 ) start = 0;
    if ( end === void 0 ) end = frag.childCount;

  var cur = this;
  for (var i = start; cur && i < end; i++)
    { cur = cur.matchType(frag.child(i).type); }
  return cur
};

prototypeAccessors$5.inlineContent.get = function () {
  var first = this.next[0];
  return first ? first.isInline : false
};

// :: ?NodeType
// Get the first matching node type at this match position that can
// be generated.
prototypeAccessors$5.defaultType.get = function () {
    var this$1 = this;

  for (var i = 0; i < this.next.length; i += 2) {
    var type = this$1.next[i];
    if (!(type.isText || type.hasRequiredAttrs())) { return type }
  }
};

ContentMatch.prototype.compatible = function compatible (other) {
    var this$1 = this;

  for (var i = 0; i < this.next.length; i += 2)
    { for (var j = 0; j < other.next.length; j += 2)
      { if (this$1.next[i] == other.next[j]) { return true } } }
  return false
};

// :: (Fragment, bool, ?number) → ?Fragment
// Try to match the given fragment, and if that fails, see if it can
// be made to match by inserting nodes in front of it. When
// successful, return a fragment of inserted nodes (which may be
// empty if nothing had to be inserted). When `toEnd` is true, only
// return a fragment if the resulting match goes to the end of the
// content expression.
ContentMatch.prototype.fillBefore = function fillBefore (after, toEnd, startIndex) {
    if ( toEnd === void 0 ) toEnd = false;
    if ( startIndex === void 0 ) startIndex = 0;

  var seen = [this];
  function search(match, types) {
    var finished = match.matchFragment(after, startIndex);
    if (finished && (!toEnd || finished.validEnd))
      { return Fragment.from(types.map(function (tp) { return tp.createAndFill(); })) }

    for (var i = 0; i < match.next.length; i += 2) {
      var type = match.next[i], next = match.next[i + 1];
      if (!(type.isText || type.hasRequiredAttrs()) && seen.indexOf(next) == -1) {
        seen.push(next);
        var found = search(next, types.concat(type));
        if (found) { return found }
      }
    }
  }

  return search(this, [])
};

// :: (NodeType) → ?[NodeType]
// Find a set of wrapping node types that would allow a node of the
// given type to appear at this position. The result may be empty
// (when it fits directly) and will be null when no such wrapping
// exists.
ContentMatch.prototype.findWrapping = function findWrapping (target) {
    var this$1 = this;

  for (var i = 0; i < this.wrapCache.length; i += 2)
    { if (this$1.wrapCache[i] == target) { return this$1.wrapCache[i + 1] } }
  var computed = this.computeWrapping(target);
  this.wrapCache.push(target, computed);
  return computed
};

ContentMatch.prototype.computeWrapping = function computeWrapping (target) {
  var seen = Object.create(null), active = [{match: this, type: null, via: null}];
  while (active.length) {
    var current = active.shift(), match = current.match;
    if (match.matchType(target)) {
      var result = [];
      for (var obj = current; obj.type; obj = obj.via)
        { result.push(obj.type); }
      return result.reverse()
    }
    for (var i = 0; i < match.next.length; i += 2) {
      var type = match.next[i];
      if (!type.isLeaf && !type.hasRequiredAttrs() && !(type.name in seen) && (!current.type || match.next[i + 1].validEnd)) {
        active.push({match: type.contentMatch, type: type, via: current});
        seen[type.name] = true;
      }
    }
  }
};

// :: number
// The number of outgoing edges this node has in the finite
// automaton that describes the content expression.
prototypeAccessors$5.edgeCount.get = function () {
  return this.next.length >> 1
};

// :: (number) → {type: NodeType, next: ContentMatch}
// Get the _n_th outgoing edge from this node in the finite
// automaton that describes the content expression.
ContentMatch.prototype.edge = function edge (n) {
  var i = n << 1;
  if (i > this.next.length) { throw new RangeError(("There's no " + n + "th edge in this content match")) }
  return {type: this.next[i], next: this.next[i + 1]}
};

ContentMatch.prototype.toString = function toString () {
  var seen = [];
  function scan(m) {
    seen.push(m);
    for (var i = 1; i < m.next.length; i += 2)
      { if (seen.indexOf(m.next[i]) == -1) { scan(m.next[i]); } }
  }
  scan(this);
  return seen.map(function (m, i) {
    var out = i + (m.validEnd ? "*" : " ") + " ";
    for (var i$1 = 0; i$1 < m.next.length; i$1 += 2)
      { out += (i$1 ? ", " : "") + m.next[i$1].name + "->" + seen.indexOf(m.next[i$1 + 1]); }
    return out
  }).join("\n")
};

Object.defineProperties( ContentMatch.prototype, prototypeAccessors$5 );

ContentMatch.empty = new ContentMatch(true);

var TokenStream = function TokenStream(string, nodeTypes) {
  this.string = string;
  this.nodeTypes = nodeTypes;
  this.inline = null;
  this.pos = 0;
  this.tokens = string.split(/\s*(?=\b|\W|$)/);
  if (this.tokens[this.tokens.length - 1] == "") { this.tokens.pop(); }
  if (this.tokens[0] == "") { this.tokens.unshift(); }
};

var prototypeAccessors$1$3 = { next: {} };

prototypeAccessors$1$3.next.get = function () { return this.tokens[this.pos] };

TokenStream.prototype.eat = function eat (tok) { return this.next == tok && (this.pos++ || true) };

TokenStream.prototype.err = function err (str) { throw new SyntaxError(str + " (in content expression '" + this.string + "')") };

Object.defineProperties( TokenStream.prototype, prototypeAccessors$1$3 );

function parseExpr(stream) {
  var exprs = [];
  do { exprs.push(parseExprSeq(stream)); }
  while (stream.eat("|"))
  return exprs.length == 1 ? exprs[0] : {type: "choice", exprs: exprs}
}

function parseExprSeq(stream) {
  var exprs = [];
  do { exprs.push(parseExprSubscript(stream)); }
  while (stream.next && stream.next != ")" && stream.next != "|")
  return exprs.length == 1 ? exprs[0] : {type: "seq", exprs: exprs}
}

function parseExprSubscript(stream) {
  var expr = parseExprAtom(stream);
  for (;;) {
    if (stream.eat("+"))
      { expr = {type: "plus", expr: expr}; }
    else if (stream.eat("*"))
      { expr = {type: "star", expr: expr}; }
    else if (stream.eat("?"))
      { expr = {type: "opt", expr: expr}; }
    else if (stream.eat("{"))
      { expr = parseExprRange(stream, expr); }
    else { break }
  }
  return expr
}

function parseNum(stream) {
  if (/\D/.test(stream.next)) { stream.err("Expected number, got '" + stream.next + "'"); }
  var result = Number(stream.next);
  stream.pos++;
  return result
}

function parseExprRange(stream, expr) {
  var min = parseNum(stream), max = min;
  if (stream.eat(",")) {
    if (stream.next != "}") { max = parseNum(stream); }
    else { max = -1; }
  }
  if (!stream.eat("}")) { stream.err("Unclosed braced range"); }
  return {type: "range", min: min, max: max, expr: expr}
}

function resolveName(stream, name) {
  var types = stream.nodeTypes, type = types[name];
  if (type) { return [type] }
  var result = [];
  for (var typeName in types) {
    var type$1 = types[typeName];
    if (type$1.groups.indexOf(name) > -1) { result.push(type$1); }
  }
  if (result.length == 0) { stream.err("No node type or group '" + name + "' found"); }
  return result
}

function parseExprAtom(stream) {
  if (stream.eat("(")) {
    var expr = parseExpr(stream);
    if (!stream.eat(")")) { stream.err("Missing closing paren"); }
    return expr
  } else if (!/\W/.test(stream.next)) {
    var exprs = resolveName(stream, stream.next).map(function (type) {
      if (stream.inline == null) { stream.inline = type.isInline; }
      else if (stream.inline != type.isInline) { stream.err("Mixing inline and block content"); }
      return {type: "name", value: type}
    });
    stream.pos++;
    return exprs.length == 1 ? exprs[0] : {type: "choice", exprs: exprs}
  } else {
    stream.err("Unexpected token '" + stream.next + "'");
  }
}

// The code below helps compile a regular-expression-like language
// into a deterministic finite automaton. For a good introduction to
// these concepts, see https://swtch.com/~rsc/regexp/regexp1.html

// : (Object) → [[{term: ?any, to: number}]]
// Construct an NFA from an expression as returned by the parser. The
// NFA is represented as an array of states, which are themselves
// arrays of edges, which are `{term, to}` objects. The first state is
// the entry state and the last node is the success state.
//
// Note that unlike typical NFAs, the edge ordering in this one is
// significant, in that it is used to contruct filler content when
// necessary.
function nfa(expr) {
  var nfa = [[]];
  connect(compile(expr, 0), node());
  return nfa

  function node() { return nfa.push([]) - 1 }
  function edge(from, to, term) {
    var edge = {term: term, to: to};
    nfa[from].push(edge);
    return edge
  }
  function connect(edges, to) { edges.forEach(function (edge) { return edge.to = to; }); }

  function compile(expr, from) {
    if (expr.type == "choice") {
      return expr.exprs.reduce(function (out, expr) { return out.concat(compile(expr, from)); }, [])
    } else if (expr.type == "seq") {
      for (var i = 0;; i++) {
        var next = compile(expr.exprs[i], from);
        if (i == expr.exprs.length - 1) { return next }
        connect(next, from = node());
      }
    } else if (expr.type == "star") {
      var loop = node();
      edge(from, loop);
      connect(compile(expr.expr, loop), loop);
      return [edge(loop)]
    } else if (expr.type == "plus") {
      var loop$1 = node();
      connect(compile(expr.expr, from), loop$1);
      connect(compile(expr.expr, loop$1), loop$1);
      return [edge(loop$1)]
    } else if (expr.type == "opt") {
      return [edge(from)].concat(compile(expr.expr, from))
    } else if (expr.type == "range") {
      var cur = from;
      for (var i$1 = 0; i$1 < expr.min; i$1++) {
        var next$1 = node();
        connect(compile(expr.expr, cur), next$1);
        cur = next$1;
      }
      if (expr.max == -1) {
        connect(compile(expr.expr, cur), cur);
      } else {
        for (var i$2 = expr.min; i$2 < expr.max; i$2++) {
          var next$2 = node();
          edge(cur, next$2);
          connect(compile(expr.expr, cur), next$2);
          cur = next$2;
        }
      }
      return [edge(cur)]
    } else if (expr.type == "name") {
      return [edge(from, null, expr.value)]
    }
  }
}

function cmp(a, b) { return a - b }

// Get the set of nodes reachable by null edges from `node`. Omit
// nodes with only a single null-out-edge, since they may lead to
// needless duplicated nodes.
function nullFrom(nfa, node) {
  var result = [];
  scan(node);
  return result.sort(cmp)

  function scan(node) {
    var edges = nfa[node];
    if (edges.length == 1 && !edges[0].term) { return scan(edges[0].to) }
    result.push(node);
    for (var i = 0; i < edges.length; i++) {
      var ref = edges[i];
      var term = ref.term;
      var to = ref.to;
      if (!term && result.indexOf(to) == -1) { scan(to); }
    }
  }
}

// : ([[{term: ?any, to: number}]]) → ContentMatch
// Compiles an NFA as produced by `nfa` into a DFA, modeled as a set
// of state objects (`ContentMatch` instances) with transitions
// between them.
function dfa(nfa) {
  var labeled = Object.create(null);
  return explore(nullFrom(nfa, 0))

  function explore(states) {
    var out = [];
    states.forEach(function (node) {
      nfa[node].forEach(function (ref) {
        var term = ref.term;
        var to = ref.to;

        if (!term) { return }
        var known = out.indexOf(term), set = known > -1 && out[known + 1];
        nullFrom(nfa, to).forEach(function (node) {
          if (!set) { out.push(term, set = []); }
          if (set.indexOf(node) == -1) { set.push(node); }
        });
      });
    });
    var state = labeled[states.join(",")] = new ContentMatch(states.indexOf(nfa.length - 1) > -1);
    for (var i = 0; i < out.length; i += 2) {
      var states$1 = out[i + 1].sort(cmp);
      state.next.push(out[i], labeled[states$1.join(",")] || explore(states$1));
    }
    return state
  }
}

function checkForDeadEnds(match, stream) {
  for (var i = 0, work = [match]; i < work.length; i++) {
    var state = work[i], dead = !state.validEnd, nodes = [];
    for (var j = 0; j < state.next.length; j += 2) {
      var node = state.next[j], next = state.next[j + 1];
      nodes.push(node.name);
      if (dead && !(node.isText || node.hasRequiredAttrs())) { dead = false; }
      if (work.indexOf(next) == -1) { work.push(next); }
    }
    if (dead) { stream.err("Only non-generatable nodes (" + nodes.join(", ") + ") in a required position"); }
  }
}

// For node types where all attrs have a default value (or which don't
// have any attributes), build up a single reusable default attribute
// object, and use it for all nodes that don't specify specific
// attributes.
function defaultAttrs(attrs) {
  var defaults = Object.create(null);
  for (var attrName in attrs) {
    var attr = attrs[attrName];
    if (!attr.hasDefault) { return null }
    defaults[attrName] = attr.default;
  }
  return defaults
}

function computeAttrs(attrs, value) {
  var built = Object.create(null);
  for (var name in attrs) {
    var given = value && value[name];
    if (given === undefined) {
      var attr = attrs[name];
      if (attr.hasDefault) { given = attr.default; }
      else { throw new RangeError("No value supplied for attribute " + name) }
    }
    built[name] = given;
  }
  return built
}

function initAttrs(attrs) {
  var result = Object.create(null);
  if (attrs) { for (var name in attrs) { result[name] = new Attribute(attrs[name]); } }
  return result
}

// ::- Node types are objects allocated once per `Schema` and used to
// [tag](#model.Node.type) `Node` instances. They contain information
// about the node type, such as its name and what kind of node it
// represents.
var NodeType = function NodeType(name, schema, spec) {
  // :: string
  // The name the node type has in this schema.
  this.name = name;

  // :: Schema
  // A link back to the `Schema` the node type belongs to.
  this.schema = schema;

  // :: NodeSpec
  // The spec that this type is based on
  this.spec = spec;

  this.groups = spec.group ? spec.group.split(" ") : [];
  this.attrs = initAttrs(spec.attrs);

  this.defaultAttrs = defaultAttrs(this.attrs);

  // :: ContentMatch
  // The starting match of the node type's content expression.
  this.contentMatch = null;

  // : ?[MarkType]
  // The set of marks allowed in this node. `null` means all marks
  // are allowed.
  this.markSet = null;

  // :: bool
  // True if this node type has inline content.
  this.inlineContent = null;

  // :: bool
  // True if this is a block type
  this.isBlock = !(spec.inline || name == "text");

  // :: bool
  // True if this is the text node type.
  this.isText = name == "text";
};

var prototypeAccessors$4 = { isInline: {},isTextblock: {},isLeaf: {},isAtom: {} };

// :: bool
// True if this is an inline type.
prototypeAccessors$4.isInline.get = function () { return !this.isBlock };

// :: bool
// True if this is a textblock type, a block that contains inline
// content.
prototypeAccessors$4.isTextblock.get = function () { return this.isBlock && this.inlineContent };

// :: bool
// True for node types that allow no content.
prototypeAccessors$4.isLeaf.get = function () { return this.contentMatch == ContentMatch.empty };

// :: bool
// True when this node is an atom, i.e. when it does not have
// directly editable content.
prototypeAccessors$4.isAtom.get = function () { return this.isLeaf || this.spec.atom };

NodeType.prototype.hasRequiredAttrs = function hasRequiredAttrs (ignore) {
    var this$1 = this;

  for (var n in this$1.attrs)
    { if (this$1.attrs[n].isRequired && (!ignore || !(n in ignore))) { return true } }
  return false
};

NodeType.prototype.compatibleContent = function compatibleContent (other) {
  return this == other || this.contentMatch.compatible(other.contentMatch)
};

NodeType.prototype.computeAttrs = function computeAttrs$1 (attrs) {
  if (!attrs && this.defaultAttrs) { return this.defaultAttrs }
  else { return computeAttrs(this.attrs, attrs) }
};

// :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
// Create a `Node` of this type. The given attributes are
// checked and defaulted (you can pass `null` to use the type's
// defaults entirely, if no required attributes exist). `content`
// may be a `Fragment`, a node, an array of nodes, or
// `null`. Similarly `marks` may be `null` to default to the empty
// set of marks.
NodeType.prototype.create = function create (attrs, content, marks) {
  if (this.isText) { throw new Error("NodeType.create can't construct text nodes") }
  return new Node(this, this.computeAttrs(attrs), Fragment.from(content), Mark.setFrom(marks))
};

// :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
// Like [`create`](#model.NodeType.create), but check the given content
// against the node type's content restrictions, and throw an error
// if it doesn't match.
NodeType.prototype.createChecked = function createChecked (attrs, content, marks) {
  content = Fragment.from(content);
  if (!this.validContent(content))
    { throw new RangeError("Invalid content for node " + this.name) }
  return new Node(this, this.computeAttrs(attrs), content, Mark.setFrom(marks))
};

// :: (?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → ?Node
// Like [`create`](#model.NodeType.create), but see if it is necessary to
// add nodes to the start or end of the given fragment to make it
// fit the node. If no fitting wrapping can be found, return null.
// Note that, due to the fact that required nodes can always be
// created, this will always succeed if you pass null or
// `Fragment.empty` as content.
NodeType.prototype.createAndFill = function createAndFill (attrs, content, marks) {
  attrs = this.computeAttrs(attrs);
  content = Fragment.from(content);
  if (content.size) {
    var before = this.contentMatch.fillBefore(content);
    if (!before) { return null }
    content = before.append(content);
  }
  var after = this.contentMatch.matchFragment(content).fillBefore(Fragment.empty, true);
  if (!after) { return null }
  return new Node(this, attrs, content.append(after), Mark.setFrom(marks))
};

// :: (Fragment) → bool
// Returns true if the given fragment is valid content for this node
// type with the given attributes.
NodeType.prototype.validContent = function validContent (content) {
    var this$1 = this;

  var result = this.contentMatch.matchFragment(content);
  if (!result || !result.validEnd) { return false }
  for (var i = 0; i < content.childCount; i++)
    { if (!this$1.allowsMarks(content.child(i).marks)) { return false } }
  return true
};

// :: (MarkType) → bool
// Check whether the given mark type is allowed in this node.
NodeType.prototype.allowsMarkType = function allowsMarkType (markType) {
  return this.markSet == null || this.markSet.indexOf(markType) > -1
};

// :: ([Mark]) → bool
// Test whether the given set of marks are allowed in this node.
NodeType.prototype.allowsMarks = function allowsMarks (marks) {
    var this$1 = this;

  if (this.markSet == null) { return true }
  for (var i = 0; i < marks.length; i++) { if (!this$1.allowsMarkType(marks[i].type)) { return false } }
  return true
};

// :: ([Mark]) → [Mark]
// Removes the marks that are not allowed in this node from the given set.
NodeType.prototype.allowedMarks = function allowedMarks (marks) {
    var this$1 = this;

  if (this.markSet == null) { return marks }
  var copy;
  for (var i = 0; i < marks.length; i++) {
    if (!this$1.allowsMarkType(marks[i].type)) {
      if (!copy) { copy = marks.slice(0, i); }
    } else if (copy) {
      copy.push(marks[i]);
    }
  }
  return !copy ? marks : copy.length ? copy : Mark.empty
};

NodeType.compile = function compile (nodes, schema) {
  var result = Object.create(null);
  nodes.forEach(function (name, spec) { return result[name] = new NodeType(name, schema, spec); });

  var topType = schema.spec.topNode || "doc";
  if (!result[topType]) { throw new RangeError("Schema is missing its top node type ('" + topType + "')") }
  if (!result.text) { throw new RangeError("Every schema needs a 'text' type") }
  for (var _ in result.text.attrs) { throw new RangeError("The text node type should not have attributes") }

  return result
};

Object.defineProperties( NodeType.prototype, prototypeAccessors$4 );

// Attribute descriptors

var Attribute = function Attribute(options) {
  this.hasDefault = Object.prototype.hasOwnProperty.call(options, "default");
  this.default = options.default;
};

var prototypeAccessors$1$2 = { isRequired: {} };

prototypeAccessors$1$2.isRequired.get = function () {
  return !this.hasDefault
};

Object.defineProperties( Attribute.prototype, prototypeAccessors$1$2 );

// Marks

// ::- Like nodes, marks (which are associated with nodes to signify
// things like emphasis or being part of a link) are
// [tagged](#model.Mark.type) with type objects, which are
// instantiated once per `Schema`.
var MarkType = function MarkType(name, rank, schema, spec) {
  // :: string
  // The name of the mark type.
  this.name = name;

  // :: Schema
  // The schema that this mark type instance is part of.
  this.schema = schema;

  // :: MarkSpec
  // The spec on which the type is based.
  this.spec = spec;

  this.attrs = initAttrs(spec.attrs);

  this.rank = rank;
  this.excluded = null;
  var defaults = defaultAttrs(this.attrs);
  this.instance = defaults && new Mark(this, defaults);
};

// :: (?Object) → Mark
// Create a mark of this type. `attrs` may be `null` or an object
// containing only some of the mark's attributes. The others, if
// they have defaults, will be added.
MarkType.prototype.create = function create (attrs) {
  if (!attrs && this.instance) { return this.instance }
  return new Mark(this, computeAttrs(this.attrs, attrs))
};

MarkType.compile = function compile (marks, schema) {
  var result = Object.create(null), rank = 0;
  marks.forEach(function (name, spec) { return result[name] = new MarkType(name, rank++, schema, spec); });
  return result
};

// :: ([Mark]) → [Mark]
// When there is a mark of this type in the given set, a new set
// without it is returned. Otherwise, the input set is returned.
MarkType.prototype.removeFromSet = function removeFromSet (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (set[i].type == this$1)
      { return set.slice(0, i).concat(set.slice(i + 1)) } }
  return set
};

// :: ([Mark]) → ?Mark
// Tests whether there is a mark of this type in the given set.
MarkType.prototype.isInSet = function isInSet (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (set[i].type == this$1) { return set[i] } }
};

// :: (MarkType) → bool
// Queries whether a given mark type is
// [excluded](#model.MarkSpec.excludes) by this one.
MarkType.prototype.excludes = function excludes (other) {
  return this.excluded.indexOf(other) > -1
};

// SchemaSpec:: interface
// An object describing a schema, as passed to the [`Schema`](#model.Schema)
// constructor.
//
//   nodes:: union<Object<NodeSpec>, OrderedMap<NodeSpec>>
//   The node types in this schema. Maps names to
//   [`NodeSpec`](#model.NodeSpec) objects that describe the node type
//   associated with that name. Their order is significant—it
//   determines which [parse rules](#model.NodeSpec.parseDOM) take
//   precedence by default, and which nodes come first in a given
//   [group](#model.NodeSpec.group).
//
//   marks:: ?union<Object<MarkSpec>, OrderedMap<MarkSpec>>
//   The mark types that exist in this schema. The order in which they
//   are provided determines the order in which [mark
//   sets](#model.Mark.addToSet) are sorted and in which [parse
//   rules](#model.MarkSpec.parseDOM) are tried.
//
//   topNode:: ?string
//   The name of the default top-level node for the schema. Defaults
//   to `"doc"`.

// NodeSpec:: interface
//
//   content:: ?string
//   The content expression for this node, as described in the [schema
//   guide](/docs/guide/#schema.content_expressions). When not given,
//   the node does not allow any content.
//
//   marks:: ?string
//   The marks that are allowed inside of this node. May be a
//   space-separated string referring to mark names or groups, `"_"`
//   to explicitly allow all marks, or `""` to disallow marks. When
//   not given, nodes with inline content default to allowing all
//   marks, other nodes default to not allowing marks.
//
//   group:: ?string
//   The group or space-separated groups to which this node belongs,
//   which can be referred to in the content expressions for the
//   schema.
//
//   inline:: ?bool
//   Should be set to true for inline nodes. (Implied for text nodes.)
//
//   atom:: ?bool
//   Can be set to true to indicate that, though this isn't a [leaf
//   node](#model.NodeType.isLeaf), it doesn't have directly editable
//   content and should be treated as a single unit in the view.
//
//   attrs:: ?Object<AttributeSpec>
//   The attributes that nodes of this type get.
//
//   selectable:: ?bool
//   Controls whether nodes of this type can be selected as a [node
//   selection](#state.NodeSelection). Defaults to true for non-text
//   nodes.
//
//   draggable:: ?bool
//   Determines whether nodes of this type can be dragged without
//   being selected. Defaults to false.
//
//   code:: ?bool
//   Can be used to indicate that this node contains code, which
//   causes some commands to behave differently.
//
//   defining:: ?bool
//   Determines whether this node is considered an important parent
//   node during replace operations (such as paste). Non-defining (the
//   default) nodes get dropped when their entire content is replaced,
//   whereas defining nodes persist and wrap the inserted content.
//   Likewise, in _inserted_ content the defining parents of the
//   content are preserved when possible. Typically,
//   non-default-paragraph textblock types, and possibly list items,
//   are marked as defining.
//
//   isolating:: ?bool
//   When enabled (default is false), the sides of nodes of this type
//   count as boundaries that regular editing operations, like
//   backspacing or lifting, won't cross. An example of a node that
//   should probably have this enabled is a table cell.
//
//   toDOM:: ?(node: Node) → DOMOutputSpec
//   Defines the default way a node of this type should be serialized
//   to DOM/HTML (as used by
//   [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)).
//   Should return a DOM node or an [array
//   structure](#model.DOMOutputSpec) that describes one, with an
//   optional number zero (“hole”) in it to indicate where the node's
//   content should be inserted.
//
//   For text nodes, the default is to create a text DOM node. Though
//   it is possible to create a serializer where text is rendered
//   differently, this is not supported inside the editor, so you
//   shouldn't override that in your text node spec.
//
//   parseDOM:: ?[ParseRule]
//   Associates DOM parser information with this node, which can be
//   used by [`DOMParser.fromSchema`](#model.DOMParser^fromSchema) to
//   automatically derive a parser. The `node` field in the rules is
//   implied (the name of this node will be filled in automatically).
//   If you supply your own parser, you do not need to also specify
//   parsing rules in your schema.
//
//   toDebugString:: ?(node: Node) -> string
//   Defines the default way a node of this type should be serialized
//   to a string representation for debugging (e.g. in error messages).

// MarkSpec:: interface
//
//   attrs:: ?Object<AttributeSpec>
//   The attributes that marks of this type get.
//
//   inclusive:: ?bool
//   Whether this mark should be active when the cursor is positioned
//   at its end (or at its start when that is also the start of the
//   parent node). Defaults to true.
//
//   excludes:: ?string
//   Determines which other marks this mark can coexist with. Should
//   be a space-separated strings naming other marks or groups of marks.
//   When a mark is [added](#model.Mark.addToSet) to a set, all marks
//   that it excludes are removed in the process. If the set contains
//   any mark that excludes the new mark but is not, itself, excluded
//   by the new mark, the mark can not be added an the set. You can
//   use the value `"_"` to indicate that the mark excludes all
//   marks in the schema.
//
//   Defaults to only being exclusive with marks of the same type. You
//   can set it to an empty string (or any string not containing the
//   mark's own name) to allow multiple marks of a given type to
//   coexist (as long as they have different attributes).
//
//   group:: ?string
//   The group or space-separated groups to which this mark belongs.
//
//   spanning:: ?bool
//   Determines whether marks of this type can span multiple adjacent
//   nodes when serialized to DOM/HTML. Defaults to true.
//
//   toDOM:: ?(mark: Mark, inline: bool) → DOMOutputSpec
//   Defines the default way marks of this type should be serialized
//   to DOM/HTML. When the resulting spec contains a hole, that is
//   where the marked content is placed. Otherwise, it is appended to
//   the top node.
//
//   parseDOM:: ?[ParseRule]
//   Associates DOM parser information with this mark (see the
//   corresponding [node spec field](#model.NodeSpec.parseDOM)). The
//   `mark` field in the rules is implied.

// AttributeSpec:: interface
//
// Used to [define](#model.NodeSpec.attrs) attributes on nodes or
// marks.
//
//   default:: ?any
//   The default value for this attribute, to use when no explicit
//   value is provided. Attributes that have no default must be
//   provided whenever a node or mark of a type that has them is
//   created.

// ::- A document schema. Holds [node](#model.NodeType) and [mark
// type](#model.MarkType) objects for the nodes and marks that may
// occur in conforming documents, and provides functionality for
// creating and deserializing such documents.
var Schema = function Schema(spec) {
  var this$1 = this;

  // :: SchemaSpec
  // The [spec](#model.SchemaSpec) on which the schema is based,
  // with the added guarantee that its `nodes` and `marks`
  // properties are
  // [`OrderedMap`](https://github.com/marijnh/orderedmap) instances
  // (not raw objects).
  this.spec = {};
  for (var prop in spec) { this$1.spec[prop] = spec[prop]; }
  this.spec.nodes = OrderedMap.from(spec.nodes);
  this.spec.marks = OrderedMap.from(spec.marks);

  // :: Object<NodeType>
  // An object mapping the schema's node names to node type objects.
  this.nodes = NodeType.compile(this.spec.nodes, this);

  // :: Object<MarkType>
  // A map from mark names to mark type objects.
  this.marks = MarkType.compile(this.spec.marks, this);

  var contentExprCache = Object.create(null);
  for (var prop$1 in this$1.nodes) {
    if (prop$1 in this$1.marks)
      { throw new RangeError(prop$1 + " can not be both a node and a mark") }
    var type = this$1.nodes[prop$1], contentExpr = type.spec.content || "", markExpr = type.spec.marks;
    type.contentMatch = contentExprCache[contentExpr] ||
      (contentExprCache[contentExpr] = ContentMatch.parse(contentExpr, this$1.nodes));
    type.inlineContent = type.contentMatch.inlineContent;
    type.markSet = markExpr == "_" ? null :
      markExpr ? gatherMarks(this$1, markExpr.split(" ")) :
      markExpr == "" || !type.inlineContent ? [] : null;
  }
  for (var prop$2 in this$1.marks) {
    var type$1 = this$1.marks[prop$2], excl = type$1.spec.excludes;
    type$1.excluded = excl == null ? [type$1] : excl == "" ? [] : gatherMarks(this$1, excl.split(" "));
  }

  this.nodeFromJSON = this.nodeFromJSON.bind(this);
  this.markFromJSON = this.markFromJSON.bind(this);

  // :: NodeType
  // The type of the [default top node](#model.SchemaSpec.topNode)
  // for this schema.
  this.topNodeType = this.nodes[this.spec.topNode || "doc"];

  // :: Object
  // An object for storing whatever values modules may want to
  // compute and cache per schema. (If you want to store something
  // in it, try to use property names unlikely to clash.)
  this.cached = Object.create(null);
  this.cached.wrappings = Object.create(null);
};

// :: (union<string, NodeType>, ?Object, ?union<Fragment, Node, [Node]>, ?[Mark]) → Node
// Create a node in this schema. The `type` may be a string or a
// `NodeType` instance. Attributes will be extended
// with defaults, `content` may be a `Fragment`,
// `null`, a `Node`, or an array of nodes.
Schema.prototype.node = function node (type, attrs, content, marks) {
  if (typeof type == "string")
    { type = this.nodeType(type); }
  else if (!(type instanceof NodeType))
    { throw new RangeError("Invalid node type: " + type) }
  else if (type.schema != this)
    { throw new RangeError("Node type from different schema used (" + type.name + ")") }

  return type.createChecked(attrs, content, marks)
};

// :: (string, ?[Mark]) → Node
// Create a text node in the schema. Empty text nodes are not
// allowed.
Schema.prototype.text = function text (text$1, marks) {
  var type = this.nodes.text;
  return new TextNode(type, type.defaultAttrs, text$1, Mark.setFrom(marks))
};

// :: (union<string, MarkType>, ?Object) → Mark
// Create a mark with the given type and attributes.
Schema.prototype.mark = function mark (type, attrs) {
  if (typeof type == "string") { type = this.marks[type]; }
  return type.create(attrs)
};

// :: (Object) → Node
// Deserialize a node from its JSON representation. This method is
// bound.
Schema.prototype.nodeFromJSON = function nodeFromJSON (json) {
  return Node.fromJSON(this, json)
};

// :: (Object) → Mark
// Deserialize a mark from its JSON representation. This method is
// bound.
Schema.prototype.markFromJSON = function markFromJSON (json) {
  return Mark.fromJSON(this, json)
};

Schema.prototype.nodeType = function nodeType (name) {
  var found = this.nodes[name];
  if (!found) { throw new RangeError("Unknown node type: " + name) }
  return found
};

function gatherMarks(schema, marks) {
  var found = [];
  for (var i = 0; i < marks.length; i++) {
    var name = marks[i], mark = schema.marks[name], ok = mark;
    if (mark) {
      found.push(mark);
    } else {
      for (var prop in schema.marks) {
        var mark$1 = schema.marks[prop];
        if (name == "_" || (mark$1.spec.group && mark$1.spec.group.split(" ").indexOf(name) > -1))
          { found.push(ok = mark$1); }
      }
    }
    if (!ok) { throw new SyntaxError("Unknown mark type: '" + marks[i] + "'") }
  }
  return found
}

// ParseOptions:: interface
// These are the options recognized by the
// [`parse`](#model.DOMParser.parse) and
// [`parseSlice`](#model.DOMParser.parseSlice) methods.
//
//   preserveWhitespace:: ?union<bool, "full">
//   By default, whitespace is collapsed as per HTML's rules. Pass
//   `true` to preserve whitespace, but normalize newlines to
//   spaces, and `"full"` to preserve whitespace entirely.
//
//   findPositions:: ?[{node: dom.Node, offset: number}]
//   When given, the parser will, beside parsing the content,
//   record the document positions of the given DOM positions. It
//   will do so by writing to the objects, adding a `pos` property
//   that holds the document position. DOM positions that are not
//   in the parsed content will not be written to.
//
//   from:: ?number
//   The child node index to start parsing from.
//
//   to:: ?number
//   The child node index to stop parsing at.
//
//   topNode:: ?Node
//   By default, the content is parsed into the schema's default
//   [top node type](#model.Schema.topNodeType). You can pass this
//   option to use the type and attributes from a different node
//   as the top container.
//
//   topMatch:: ?ContentMatch
//   Provide the starting content match that content parsed into the
//   top node is matched against.
//
//   context:: ?ResolvedPos
//   A set of additional nodes to count as
//   [context](#model.ParseRule.context) when parsing, above the
//   given [top node](#model.ParseOptions.topNode).

// ParseRule:: interface
// A value that describes how to parse a given DOM node or inline
// style as a ProseMirror node or mark.
//
//   tag:: ?string
//   A CSS selector describing the kind of DOM elements to match. A
//   single rule should have _either_ a `tag` or a `style` property.
//
//   namespace:: ?string
//   The namespace to match. This should be used with `tag`.
//   Nodes are only matched when the namespace matches or this property
//   is null.
//
//   style:: ?string
//   A CSS property name to match. When given, this rule matches
//   inline styles that list that property. May also have the form
//   `"property=value"`, in which case the rule only matches if the
//   propery's value exactly matches the given value. (For more
//   complicated filters, use [`getAttrs`](#model.ParseRule.getAttrs)
//   and return undefined to indicate that the match failed.)
//
//   priority:: ?number
//   Can be used to change the order in which the parse rules in a
//   schema are tried. Those with higher priority come first. Rules
//   without a priority are counted as having priority 50. This
//   property is only meaningful in a schema—when directly
//   constructing a parser, the order of the rule array is used.
//
//   context:: ?string
//   When given, restricts this rule to only match when the current
//   context—the parent nodes into which the content is being
//   parsed—matches this expression. Should contain one or more node
//   names or node group names followed by single or double slashes.
//   For example `"paragraph/"` means the rule only matches when the
//   parent node is a paragraph, `"blockquote/paragraph/"` restricts
//   it to be in a paragraph that is inside a blockquote, and
//   `"section//"` matches any position inside a section—a double
//   slash matches any sequence of ancestor nodes. To allow multiple
//   different contexts, they can be separated by a pipe (`|`)
//   character, as in `"blockquote/|list_item/"`.
//
//   node:: ?string
//   The name of the node type to create when this rule matches. Only
//   valid for rules with a `tag` property, not for style rules. Each
//   rule should have one of a `node`, `mark`, or `ignore` property
//   (except when it appears in a [node](#model.NodeSpec.parseDOM) or
//   [mark spec](#model.MarkSpec.parseDOM), in which case the `node`
//   or `mark` property will be derived from its position).
//
//   mark:: ?string
//   The name of the mark type to wrap the matched content in.
//
//   ignore:: ?bool
//   When true, ignore content that matches this rule.
//
//   skip:: ?bool
//   When true, ignore the node that matches this rule, but do parse
//   its content.
//
//   attrs:: ?Object
//   Attributes for the node or mark created by this rule. When
//   `getAttrs` is provided, it takes precedence.
//
//   getAttrs:: ?(union<dom.Node, string>) → ?union<Object, false>
//   A function used to compute the attributes for the node or mark
//   created by this rule. Can also be used to describe further
//   conditions the DOM element or style must match. When it returns
//   `false`, the rule won't match. When it returns null or undefined,
//   that is interpreted as an empty/default set of attributes.
//
//   Called with a DOM Element for `tag` rules, and with a string (the
//   style's value) for `style` rules.
//
//   contentElement:: ?union<string, (dom.Node) → dom.Node>
//   For `tag` rules that produce non-leaf nodes or marks, by default
//   the content of the DOM element is parsed as content of the mark
//   or node. If the child nodes are in a descendent node, this may be
//   a CSS selector string that the parser must use to find the actual
//   content element, or a function that returns the actual content
//   element to the parser.
//
//   getContent:: ?(dom.Node, schema: Schema) → Fragment
//   Can be used to override the content of a matched node. When
//   present, instead of parsing the node's child nodes, the result of
//   this function is used.
//
//   preserveWhitespace:: ?union<bool, "full">
//   Controls whether whitespace should be preserved when parsing the
//   content inside the matched element. `false` means whitespace may
//   be collapsed, `true` means that whitespace should be preserved
//   but newlines normalized to spaces, and `"full"` means that
//   newlines should also be preserved.

// ::- A DOM parser represents a strategy for parsing DOM content into
// a ProseMirror document conforming to a given schema. Its behavior
// is defined by an array of [rules](#model.ParseRule).
var DOMParser = function DOMParser(schema, rules) {
  var this$1 = this;

  // :: Schema
  // The schema into which the parser parses.
  this.schema = schema;
  // :: [ParseRule]
  // The set of [parse rules](#model.ParseRule) that the parser
  // uses, in order of precedence.
  this.rules = rules;
  this.tags = [];
  this.styles = [];

  rules.forEach(function (rule) {
    if (rule.tag) { this$1.tags.push(rule); }
    else if (rule.style) { this$1.styles.push(rule); }
  });
};

// :: (dom.Node, ?ParseOptions) → Node
// Parse a document from the content of a DOM node.
DOMParser.prototype.parse = function parse (dom, options) {
    if ( options === void 0 ) options = {};

  var context = new ParseContext(this, options, false);
  context.addAll(dom, null, options.from, options.to);
  return context.finish()
};

// :: (dom.Node, ?ParseOptions) → Slice
// Parses the content of the given DOM node, like
// [`parse`](#model.DOMParser.parse), and takes the same set of
// options. But unlike that method, which produces a whole node,
// this one returns a slice that is open at the sides, meaning that
// the schema constraints aren't applied to the start of nodes to
// the left of the input and the end of nodes at the end.
DOMParser.prototype.parseSlice = function parseSlice (dom, options) {
    if ( options === void 0 ) options = {};

  var context = new ParseContext(this, options, true);
  context.addAll(dom, null, options.from, options.to);
  return Slice.maxOpen(context.finish())
};

DOMParser.prototype.matchTag = function matchTag (dom, context) {
    var this$1 = this;

  for (var i = 0; i < this.tags.length; i++) {
    var rule = this$1.tags[i];
    if (matches(dom, rule.tag) &&
        (rule.namespace === undefined || dom.namespaceURI == rule.namespace) &&
        (!rule.context || context.matchesContext(rule.context))) {
      if (rule.getAttrs) {
        var result = rule.getAttrs(dom);
        if (result === false) { continue }
        rule.attrs = result;
      }
      return rule
    }
  }
};

DOMParser.prototype.matchStyle = function matchStyle (prop, value, context) {
    var this$1 = this;

  for (var i = 0; i < this.styles.length; i++) {
    var rule = this$1.styles[i];
    if (rule.style.indexOf(prop) != 0 ||
        rule.context && !context.matchesContext(rule.context) ||
        // Test that the style string either precisely matches the prop,
        // or has an '=' sign after the prop, followed by the given
        // value.
        rule.style.length > prop.length &&
        (rule.style.charCodeAt(prop.length) != 61 || rule.style.slice(prop.length + 1) != value))
      { continue }
    if (rule.getAttrs) {
      var result = rule.getAttrs(value);
      if (result === false) { continue }
      rule.attrs = result;
    }
    return rule
  }
};

// : (Schema) → [ParseRule]
DOMParser.schemaRules = function schemaRules (schema) {
  var result = [];
  function insert(rule) {
    var priority = rule.priority == null ? 50 : rule.priority, i = 0;
    for (; i < result.length; i++) {
      var next = result[i], nextPriority = next.priority == null ? 50 : next.priority;
      if (nextPriority < priority) { break }
    }
    result.splice(i, 0, rule);
  }

  var loop = function ( name ) {
    var rules = schema.marks[name].spec.parseDOM;
    if (rules) { rules.forEach(function (rule) {
      insert(rule = copy(rule));
      rule.mark = name;
    }); }
  };

    for (var name in schema.marks) loop( name );
  var loop$1 = function ( name ) {
    var rules$1 = schema.nodes[name$1].spec.parseDOM;
    if (rules$1) { rules$1.forEach(function (rule) {
      insert(rule = copy(rule));
      rule.node = name$1;
    }); }
  };

    for (var name$1 in schema.nodes) loop$1( name );
  return result
};

// :: (Schema) → DOMParser
// Construct a DOM parser using the parsing rules listed in a
// schema's [node specs](#model.NodeSpec.parseDOM), reordered by
// [priority](#model.ParseRule.priority).
DOMParser.fromSchema = function fromSchema (schema) {
  return schema.cached.domParser ||
    (schema.cached.domParser = new DOMParser(schema, DOMParser.schemaRules(schema)))
};

// : Object<bool> The block-level tags in HTML5
var blockTags = {
  address: true, article: true, aside: true, blockquote: true, canvas: true,
  dd: true, div: true, dl: true, fieldset: true, figcaption: true, figure: true,
  footer: true, form: true, h1: true, h2: true, h3: true, h4: true, h5: true,
  h6: true, header: true, hgroup: true, hr: true, li: true, noscript: true, ol: true,
  output: true, p: true, pre: true, section: true, table: true, tfoot: true, ul: true
};

// : Object<bool> The tags that we normally ignore.
var ignoreTags = {
  head: true, noscript: true, object: true, script: true, style: true, title: true
};

// : Object<bool> List tags.
var listTags = {ol: true, ul: true};

// Using a bitfield for node context options
var OPT_PRESERVE_WS = 1;
var OPT_PRESERVE_WS_FULL = 2;
var OPT_OPEN_LEFT = 4;

function wsOptionsFor(preserveWhitespace) {
  return (preserveWhitespace ? OPT_PRESERVE_WS : 0) | (preserveWhitespace === "full" ? OPT_PRESERVE_WS_FULL : 0)
}

var NodeContext = function NodeContext(type, attrs, marks, solid, match, options) {
  this.type = type;
  this.attrs = attrs;
  this.solid = solid;
  this.match = match || (options & OPT_OPEN_LEFT ? null : type.contentMatch);
  this.options = options;
  this.content = [];
  this.marks = marks;
  this.activeMarks = Mark.none;
};

NodeContext.prototype.findWrapping = function findWrapping (node) {
  if (!this.match) {
    if (!this.type) { return [] }
    var fill = this.type.contentMatch.fillBefore(Fragment.from(node));
    if (fill) {
      this.match = this.type.contentMatch.matchFragment(fill);
    } else {
      var start = this.type.contentMatch, wrap;
      if (wrap = start.findWrapping(node.type)) {
        this.match = start;
        return wrap
      } else {
        return null
      }
    }
  }
  return this.match.findWrapping(node.type)
};

NodeContext.prototype.finish = function finish (openEnd) {
  if (!(this.options & OPT_PRESERVE_WS)) { // Strip trailing whitespace
    var last = this.content[this.content.length - 1], m;
    if (last && last.isText && (m = /\s+$/.exec(last.text))) {
      if (last.text.length == m[0].length) { this.content.pop(); }
      else { this.content[this.content.length - 1] = last.withText(last.text.slice(0, last.text.length - m[0].length)); }
    }
  }
  var content = Fragment.from(this.content);
  if (!openEnd && this.match)
    { content = content.append(this.match.fillBefore(Fragment.empty, true)); }
  return this.type ? this.type.create(this.attrs, content, this.marks) : content
};

var ParseContext = function ParseContext(parser, options, open) {
  // : DOMParser The parser we are using.
  this.parser = parser;
  // : Object The options passed to this parse.
  this.options = options;
  this.isOpen = open;
  this.pendingMarks = [];
  var topNode = options.topNode, topContext;
  var topOptions = wsOptionsFor(options.preserveWhitespace) | (open ? OPT_OPEN_LEFT : 0);
  if (topNode)
    { topContext = new NodeContext(topNode.type, topNode.attrs, Mark.none, true,
                                 options.topMatch || topNode.type.contentMatch, topOptions); }
  else if (open)
    { topContext = new NodeContext(null, null, Mark.none, true, null, topOptions); }
  else
    { topContext = new NodeContext(parser.schema.topNodeType, null, Mark.none, true, null, topOptions); }
  this.nodes = [topContext];
  // : [Mark] The current set of marks
  this.open = 0;
  this.find = options.findPositions;
  this.needsBlock = false;
};

var prototypeAccessors$6 = { top: {},currentPos: {} };

prototypeAccessors$6.top.get = function () {
  return this.nodes[this.open]
};

// : (dom.Node)
// Add a DOM node to the content. Text is inserted as text node,
// otherwise, the node is passed to `addElement` or, if it has a
// `style` attribute, `addElementWithStyles`.
ParseContext.prototype.addDOM = function addDOM (dom) {
    var this$1 = this;

  if (dom.nodeType == 3) {
    this.addTextNode(dom);
  } else if (dom.nodeType == 1) {
    var style = dom.getAttribute("style");
    var marks = style ? this.readStyles(parseStyles(style)) : null;
    if (marks != null) { for (var i = 0; i < marks.length; i++) { this$1.addPendingMark(marks[i]); } }
    this.addElement(dom);
    if (marks != null) { for (var i$1 = 0; i$1 < marks.length; i$1++) { this$1.removePendingMark(marks[i$1]); } }
  }
};

ParseContext.prototype.addTextNode = function addTextNode (dom) {
  var value = dom.nodeValue;
  var top = this.top;
  if ((top.type ? top.type.inlineContent : top.content.length && top.content[0].isInline) || /\S/.test(value)) {
    if (!(top.options & OPT_PRESERVE_WS)) {
      value = value.replace(/\s+/g, " ");
      // If this starts with whitespace, and there is no node before it, or
      // a hard break, or a text node that ends with whitespace, strip the
      // leading space.
      if (/^\s/.test(value) && this.open == this.nodes.length - 1) {
        var nodeBefore = top.content[top.content.length - 1];
        var domNodeBefore = dom.previousSibling;
        if (!nodeBefore ||
            (domNodeBefore && domNodeBefore.nodeName == 'BR') ||
            (nodeBefore.isText && /\s$/.test(nodeBefore.text)))
          { value = value.slice(1); }
      }
    } else if (!(top.options & OPT_PRESERVE_WS_FULL)) {
      value = value.replace(/\r?\n|\r/g, " ");
    }
    if (value) { this.insertNode(this.parser.schema.text(value)); }
    this.findInText(dom);
  } else {
    this.findInside(dom);
  }
};

// : (dom.Element)
// Try to find a handler for the given tag and use that to parse. If
// none is found, the element's content nodes are added directly.
ParseContext.prototype.addElement = function addElement (dom) {
  var name = dom.nodeName.toLowerCase();
  if (listTags.hasOwnProperty(name)) { normalizeList(dom); }
  var rule = (this.options.ruleFromNode && this.options.ruleFromNode(dom)) || this.parser.matchTag(dom, this);
  if (rule ? rule.ignore : ignoreTags.hasOwnProperty(name)) {
    this.findInside(dom);
  } else if (!rule || rule.skip) {
    if (rule && rule.skip.nodeType) { dom = rule.skip; }
    var sync, top = this.top, oldNeedsBlock = this.needsBlock;
    if (blockTags.hasOwnProperty(name)) {
      sync = true;
      if (!top.type) { this.needsBlock = true; }
    }
    this.addAll(dom);
    if (sync) { this.sync(top); }
    this.needsBlock = oldNeedsBlock;
  } else {
    this.addElementByRule(dom, rule);
  }
};

// Run any style parser associated with the node's styles. Either
// return an array of marks, or null to indicate some of the styles
// had a rule with `ignore` set.
ParseContext.prototype.readStyles = function readStyles (styles) {
    var this$1 = this;

  var marks = Mark.none;
  for (var i = 0; i < styles.length; i += 2) {
    var rule = this$1.parser.matchStyle(styles[i], styles[i + 1], this$1);
    if (!rule) { continue }
    if (rule.ignore) { return null }
    marks = this$1.parser.schema.marks[rule.mark].create(rule.attrs).addToSet(marks);
  }
  return marks
};

// : (dom.Element, ParseRule) → bool
// Look up a handler for the given node. If none are found, return
// false. Otherwise, apply it, use its return value to drive the way
// the node's content is wrapped, and return true.
ParseContext.prototype.addElementByRule = function addElementByRule (dom, rule) {
    var this$1 = this;

  var sync, nodeType, markType, mark;
  if (rule.node) {
    nodeType = this.parser.schema.nodes[rule.node];
    if (nodeType.isLeaf) { this.insertNode(nodeType.create(rule.attrs)); }
    else { sync = this.enter(nodeType, rule.attrs, rule.preserveWhitespace); }
  } else {
    markType = this.parser.schema.marks[rule.mark];
    mark = markType.create(rule.attrs);
    this.addPendingMark(mark);
  }
  var startIn = this.top;

  if (nodeType && nodeType.isLeaf) {
    this.findInside(dom);
  } else if (rule.getContent) {
    this.findInside(dom);
    rule.getContent(dom, this.parser.schema).forEach(function (node) { return this$1.insertNode(node); });
  } else {
    var contentDOM = rule.contentElement;
    if (typeof contentDOM == "string") { contentDOM = dom.querySelector(contentDOM); }
    else if (typeof contentDOM == "function") { contentDOM = contentDOM(dom); }
    if (!contentDOM) { contentDOM = dom; }
    this.findAround(dom, contentDOM, true);
    this.addAll(contentDOM, sync);
  }
  if (sync) { this.sync(startIn); this.open--; }
  if (mark) { this.removePendingMark(mark); }
  return true
};

// : (dom.Node, ?NodeBuilder, ?number, ?number)
// Add all child nodes between `startIndex` and `endIndex` (or the
// whole node, if not given). If `sync` is passed, use it to
// synchronize after every block element.
ParseContext.prototype.addAll = function addAll (parent, sync, startIndex, endIndex) {
    var this$1 = this;

  var index = startIndex || 0;
  for (var dom = startIndex ? parent.childNodes[startIndex] : parent.firstChild,
           end = endIndex == null ? null : parent.childNodes[endIndex];
       dom != end; dom = dom.nextSibling, ++index) {
    this$1.findAtPoint(parent, index);
    this$1.addDOM(dom);
    if (sync && blockTags.hasOwnProperty(dom.nodeName.toLowerCase()))
      { this$1.sync(sync); }
  }
  this.findAtPoint(parent, index);
};

// Try to find a way to fit the given node type into the current
// context. May add intermediate wrappers and/or leave non-solid
// nodes that we're in.
ParseContext.prototype.findPlace = function findPlace (node) {
    var this$1 = this;

  var route, sync;
  for (var depth = this.open; depth >= 0; depth--) {
    var cx = this$1.nodes[depth];
    var found = cx.findWrapping(node);
    if (found && (!route || route.length > found.length)) {
      route = found;
      sync = cx;
      if (!found.length) { break }
    }
    if (cx.solid) { break }
  }
  if (!route) { return false }
  this.sync(sync);
  for (var i = 0; i < route.length; i++)
    { this$1.enterInner(route[i], null, false); }
  return true
};

// : (Node) → ?Node
// Try to insert the given node, adjusting the context when needed.
ParseContext.prototype.insertNode = function insertNode (node) {
  if (node.isInline && this.needsBlock && !this.top.type) {
    var block = this.textblockFromContext();
    if (block) { this.enterInner(block); }
  }
  if (this.findPlace(node)) {
    this.closeExtra();
    var top = this.top;
    this.applyPendingMarks(top);
    if (top.match) { top.match = top.match.matchType(node.type); }
    var marks = top.activeMarks;
    for (var i = 0; i < node.marks.length; i++)
      { if (!top.type || top.type.allowsMarkType(node.marks[i].type))
        { marks = node.marks[i].addToSet(marks); } }
    top.content.push(node.mark(marks));
  }
};

ParseContext.prototype.applyPendingMarks = function applyPendingMarks (top) {
    var this$1 = this;

  for (var i = 0; i < this.pendingMarks.length; i++) {
    var mark = this$1.pendingMarks[i];
    if ((!top.type || top.type.allowsMarkType(mark.type)) && !mark.isInSet(top.activeMarks)) {
      top.activeMarks = mark.addToSet(top.activeMarks);
      this$1.pendingMarks.splice(i--, 1);
    }
  }
};

// : (NodeType, ?Object) → bool
// Try to start a node of the given type, adjusting the context when
// necessary.
ParseContext.prototype.enter = function enter (type, attrs, preserveWS) {
  var ok = this.findPlace(type.create(attrs));
  if (ok) {
    this.applyPendingMarks(this.top);
    this.enterInner(type, attrs, true, preserveWS);
  }
  return ok
};

// Open a node of the given type
ParseContext.prototype.enterInner = function enterInner (type, attrs, solid, preserveWS) {
  this.closeExtra();
  var top = this.top;
  top.match = top.match && top.match.matchType(type, attrs);
  var options = preserveWS == null ? top.options & ~OPT_OPEN_LEFT : wsOptionsFor(preserveWS);
  if ((top.options & OPT_OPEN_LEFT) && top.content.length == 0) { options |= OPT_OPEN_LEFT; }
  this.nodes.push(new NodeContext(type, attrs, top.activeMarks, solid, null, options));
  this.open++;
};

// Make sure all nodes above this.open are finished and added to
// their parents
ParseContext.prototype.closeExtra = function closeExtra (openEnd) {
    var this$1 = this;

  var i = this.nodes.length - 1;
  if (i > this.open) {
    for (; i > this.open; i--) { this$1.nodes[i - 1].content.push(this$1.nodes[i].finish(openEnd)); }
    this.nodes.length = this.open + 1;
  }
};

ParseContext.prototype.finish = function finish () {
  this.open = 0;
  this.closeExtra(this.isOpen);
  return this.nodes[0].finish(this.isOpen || this.options.topOpen)
};

ParseContext.prototype.sync = function sync (to) {
    var this$1 = this;

  for (var i = this.open; i >= 0; i--) { if (this$1.nodes[i] == to) {
    this$1.open = i;
    return
  } }
};

ParseContext.prototype.addPendingMark = function addPendingMark (mark) {
  this.pendingMarks.push(mark);
};

ParseContext.prototype.removePendingMark = function removePendingMark (mark) {
  var found = this.pendingMarks.lastIndexOf(mark);
  if (found > -1) {
    this.pendingMarks.splice(found, 1);
  } else {
    var top = this.top;
    top.activeMarks = mark.removeFromSet(top.activeMarks);
  }
};

prototypeAccessors$6.currentPos.get = function () {
    var this$1 = this;

  this.closeExtra();
  var pos = 0;
  for (var i = this.open; i >= 0; i--) {
    var content = this$1.nodes[i].content;
    for (var j = content.length - 1; j >= 0; j--)
      { pos += content[j].nodeSize; }
    if (i) { pos++; }
  }
  return pos
};

ParseContext.prototype.findAtPoint = function findAtPoint (parent, offset) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].node == parent && this$1.find[i].offset == offset)
      { this$1.find[i].pos = this$1.currentPos; }
  } }
};

ParseContext.prototype.findInside = function findInside (parent) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].pos == null && parent.nodeType == 1 && parent.contains(this$1.find[i].node))
      { this$1.find[i].pos = this$1.currentPos; }
  } }
};

ParseContext.prototype.findAround = function findAround (parent, content, before) {
    var this$1 = this;

  if (parent != content && this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].pos == null && parent.nodeType == 1 && parent.contains(this$1.find[i].node)) {
      var pos = content.compareDocumentPosition(this$1.find[i].node);
      if (pos & (before ? 2 : 4))
        { this$1.find[i].pos = this$1.currentPos; }
    }
  } }
};

ParseContext.prototype.findInText = function findInText (textNode) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].node == textNode)
      { this$1.find[i].pos = this$1.currentPos - (textNode.nodeValue.length - this$1.find[i].offset); }
  } }
};

// : (string) → bool
// Determines whether the given [context
// string](#ParseRule.context) matches this context.
ParseContext.prototype.matchesContext = function matchesContext (context) {
    var this$1 = this;

  if (context.indexOf("|") > -1)
    { return context.split(/\s*\|\s*/).some(this.matchesContext, this) }

  var parts = context.split("/");
  var option = this.options.context;
  var useRoot = !this.isOpen && (!option || option.parent.type == this.nodes[0].type);
  var minDepth = -(option ? option.depth + 1 : 0) + (useRoot ? 0 : 1);
  var match = function (i, depth) {
    for (; i >= 0; i--) {
      var part = parts[i];
      if (part == "") {
        if (i == parts.length - 1 || i == 0) { continue }
        for (; depth >= minDepth; depth--)
          { if (match(i - 1, depth)) { return true } }
        return false
      } else {
        var next = depth > 0 || (depth == 0 && useRoot) ? this$1.nodes[depth].type
            : option && depth >= minDepth ? option.node(depth - minDepth).type
            : null;
        if (!next || (next.name != part && next.groups.indexOf(part) == -1))
          { return false }
        depth--;
      }
    }
    return true
  };
  return match(parts.length - 1, this.open)
};

ParseContext.prototype.textblockFromContext = function textblockFromContext () {
    var this$1 = this;

  var $context = this.options.context;
  if ($context) { for (var d = $context.depth; d >= 0; d--) {
    var deflt = $context.node(d).contentMatchAt($context.indexAfter(d)).defaultType;
    if (deflt && deflt.isTextblock && deflt.defaultAttrs) { return deflt }
  } }
  for (var name in this$1.parser.schema.nodes) {
    var type = this$1.parser.schema.nodes[name];
    if (type.isTextblock && type.defaultAttrs) { return type }
  }
};

Object.defineProperties( ParseContext.prototype, prototypeAccessors$6 );

// Kludge to work around directly nested list nodes produced by some
// tools and allowed by browsers to mean that the nested list is
// actually part of the list item above it.
function normalizeList(dom) {
  for (var child = dom.firstChild, prevItem = null; child; child = child.nextSibling) {
    var name = child.nodeType == 1 ? child.nodeName.toLowerCase() : null;
    if (name && listTags.hasOwnProperty(name) && prevItem) {
      prevItem.appendChild(child);
      child = prevItem;
    } else if (name == "li") {
      prevItem = child;
    } else if (name) {
      prevItem = null;
    }
  }
}

// Apply a CSS selector.
function matches(dom, selector) {
  return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector)
}

// : (string) → [string]
// Tokenize a style attribute into property/value pairs.
function parseStyles(style) {
  var re = /\s*([\w-]+)\s*:\s*([^;]+)/g, m, result = [];
  while (m = re.exec(style)) { result.push(m[1], m[2].trim()); }
  return result
}

function copy(obj) {
  var copy = {};
  for (var prop in obj) { copy[prop] = obj[prop]; }
  return copy
}

// DOMOutputSpec:: interface
// A description of a DOM structure. Can be either a string, which is
// interpreted as a text node, a DOM node, which is interpreted as
// itself, or an array.
//
// An array describes a DOM element. The first value in the array
// should be a string—the name of the DOM element. If the second
// element is plain object, it is interpreted as a set of attributes
// for the element. Any elements after that (including the 2nd if it's
// not an attribute object) are interpreted as children of the DOM
// elements, and must either be valid `DOMOutputSpec` values, or the
// number zero.
//
// The number zero (pronounced “hole”) is used to indicate the place
// where a node's child nodes should be inserted. It it occurs in an
// output spec, it should be the only child element in its parent
// node.

// ::- A DOM serializer knows how to convert ProseMirror nodes and
// marks of various types to DOM nodes.
var DOMSerializer = function DOMSerializer(nodes, marks) {
  // :: Object<(node: Node) → DOMOutputSpec>
  // The node serialization functions.
  this.nodes = nodes || {};
  // :: Object<?(mark: Mark, inline: bool) → DOMOutputSpec>
  // The mark serialization functions.
  this.marks = marks || {};
};

// :: (Fragment, ?Object) → dom.DocumentFragment
// Serialize the content of this fragment to a DOM fragment. When
// not in the browser, the `document` option, containing a DOM
// document, should be passed so that the serializer can create
// nodes.
DOMSerializer.prototype.serializeFragment = function serializeFragment (fragment, options, target) {
    var this$1 = this;
    if ( options === void 0 ) options = {};

  if (!target) { target = doc(options).createDocumentFragment(); }

  var top = target, active = null;
  fragment.forEach(function (node) {
    if (active || node.marks.length) {
      if (!active) { active = []; }
      var keep = 0, rendered = 0;
      while (keep < active.length && rendered < node.marks.length) {
        var next = node.marks[rendered];
        if (!this$1.marks[next.type.name]) { rendered++; continue }
        if (!next.eq(active[keep]) || next.type.spec.spanning === false) { break }
        keep += 2; rendered++;
      }
      while (keep < active.length) {
        top = active.pop();
        active.pop();
      }
      while (rendered < node.marks.length) {
        var add = node.marks[rendered++];
        var markDOM = this$1.serializeMark(add, node.isInline, options);
        if (markDOM) {
          active.push(add, top);
          top.appendChild(markDOM.dom);
          top = markDOM.contentDOM || markDOM.dom;
        }
      }
    }
    top.appendChild(this$1.serializeNode(node, options));
  });

  return target
};

// :: (Node, ?Object) → dom.Node
// Serialize this node to a DOM node. This can be useful when you
// need to serialize a part of a document, as opposed to the whole
// document. To serialize a whole document, use
// [`serializeFragment`](#model.DOMSerializer.serializeFragment) on
// its [content](#model.Node.content).
DOMSerializer.prototype.serializeNode = function serializeNode (node, options) {
    if ( options === void 0 ) options = {};

  var ref =
      DOMSerializer.renderSpec(doc(options), this.nodes[node.type.name](node));
    var dom = ref.dom;
    var contentDOM = ref.contentDOM;
  if (contentDOM) {
    if (node.isLeaf)
      { throw new RangeError("Content hole not allowed in a leaf node spec") }
    if (options.onContent)
      { options.onContent(node, contentDOM, options); }
    else
      { this.serializeFragment(node.content, options, contentDOM); }
  }
  return dom
};

DOMSerializer.prototype.serializeNodeAndMarks = function serializeNodeAndMarks (node, options) {
    var this$1 = this;
    if ( options === void 0 ) options = {};

  var dom = this.serializeNode(node, options);
  for (var i = node.marks.length - 1; i >= 0; i--) {
    var wrap = this$1.serializeMark(node.marks[i], node.isInline, options);
    if (wrap) {
      (wrap.contentDOM || wrap.dom).appendChild(dom);
      dom = wrap.dom;
    }
  }
  return dom
};

DOMSerializer.prototype.serializeMark = function serializeMark (mark, inline, options) {
    if ( options === void 0 ) options = {};

  var toDOM = this.marks[mark.type.name];
  return toDOM && DOMSerializer.renderSpec(doc(options), toDOM(mark, inline))
};

// :: (dom.Document, DOMOutputSpec) → {dom: dom.Node, contentDOM: ?dom.Node}
// Render an [output spec](#model.DOMOutputSpec) to a DOM node. If
// the spec has a hole (zero) in it, `contentDOM` will point at the
// node with the hole.
DOMSerializer.renderSpec = function renderSpec (doc, structure) {
  if (typeof structure == "string")
    { return {dom: doc.createTextNode(structure)} }
  if (structure.nodeType != null)
    { return {dom: structure} }
  var dom = doc.createElement(structure[0]), contentDOM = null;
  var attrs = structure[1], start = 1;
  if (attrs && typeof attrs == "object" && attrs.nodeType == null && !Array.isArray(attrs)) {
    start = 2;
    for (var name in attrs) {
      if (attrs[name] != null) { dom.setAttribute(name, attrs[name]); }
    }
  }
  for (var i = start; i < structure.length; i++) {
    var child = structure[i];
    if (child === 0) {
      if (i < structure.length - 1 || i > start)
        { throw new RangeError("Content hole must be the only child of its parent node") }
      return {dom: dom, contentDOM: dom}
    } else {
      var ref = DOMSerializer.renderSpec(doc, child);
        var inner = ref.dom;
        var innerContent = ref.contentDOM;
      dom.appendChild(inner);
      if (innerContent) {
        if (contentDOM) { throw new RangeError("Multiple content holes") }
        contentDOM = innerContent;
      }
    }
  }
  return {dom: dom, contentDOM: contentDOM}
};

// :: (Schema) → DOMSerializer
// Build a serializer using the [`toDOM`](#model.NodeSpec.toDOM)
// properties in a schema's node and mark specs.
DOMSerializer.fromSchema = function fromSchema (schema) {
  return schema.cached.domSerializer ||
    (schema.cached.domSerializer = new DOMSerializer(this.nodesFromSchema(schema), this.marksFromSchema(schema)))
};

// : (Schema) → Object<(node: Node) → DOMOutputSpec>
// Gather the serializers in a schema's node specs into an object.
// This can be useful as a base to build a custom serializer from.
DOMSerializer.nodesFromSchema = function nodesFromSchema (schema) {
  var result = gatherToDOM(schema.nodes);
  if (!result.text) { result.text = function (node) { return node.text; }; }
  return result
};

// : (Schema) → Object<(mark: Mark) → DOMOutputSpec>
// Gather the serializers in a schema's mark specs into an object.
DOMSerializer.marksFromSchema = function marksFromSchema (schema) {
  return gatherToDOM(schema.marks)
};

function gatherToDOM(obj) {
  var result = {};
  for (var name in obj) {
    var toDOM = obj[name].spec.toDOM;
    if (toDOM) { result[name] = toDOM; }
  }
  return result
}

function doc(options) {
  // declare global: window
  return options.document || window.document
}

exports.Node = Node;
exports.ResolvedPos = ResolvedPos;
exports.NodeRange = NodeRange;
exports.Fragment = Fragment;
exports.Slice = Slice;
exports.ReplaceError = ReplaceError;
exports.Mark = Mark;
exports.Schema = Schema;
exports.NodeType = NodeType;
exports.MarkType = MarkType;
exports.ContentMatch = ContentMatch;
exports.DOMParser = DOMParser;
exports.DOMSerializer = DOMSerializer;
//# sourceMappingURL=index.js.map

},{"orderedmap":"../node_modules/orderedmap/index.js"}],"../node_modules/prosemirror-transform/dist/index.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var prosemirrorModel = require('prosemirror-model');

// Mappable:: interface
// There are several things that positions can be mapped through.
// Such objects conform to this interface.
//
//   map:: (pos: number, assoc: ?number) → number
//   Map a position through this object. When given, `assoc` (should
//   be -1 or 1, defaults to 1) determines with which side the
//   position is associated, which determines in which direction to
//   move when a chunk of content is inserted at the mapped position.
//
//   mapResult:: (pos: number, assoc: ?number) → MapResult
//   Map a position, and return an object containing additional
//   information about the mapping. The result's `deleted` field tells
//   you whether the position was deleted (completely enclosed in a
//   replaced range) during the mapping. When content on only one side
//   is deleted, the position itself is only considered deleted when
//   `assoc` points in the direction of the deleted content.

// Recovery values encode a range index and an offset. They are
// represented as numbers, because tons of them will be created when
// mapping, for example, a large number of decorations. The number's
// lower 16 bits provide the index, the remaining bits the offset.
//
// Note: We intentionally don't use bit shift operators to en- and
// decode these, since those clip to 32 bits, which we might in rare
// cases want to overflow. A 64-bit float can represent 48-bit
// integers precisely.

var lower16 = 0xffff;
var factor16 = Math.pow(2, 16);

function makeRecover(index, offset) { return index + offset * factor16 }
function recoverIndex(value) { return value & lower16 }
function recoverOffset(value) { return (value - (value & lower16)) / factor16 }

// ::- An object representing a mapped position with extra
// information.
var MapResult = function MapResult(pos, deleted, recover) {
  if ( deleted === void 0 ) deleted = false;
  if ( recover === void 0 ) recover = null;

  // :: number The mapped version of the position.
  this.pos = pos;
  // :: bool Tells you whether the position was deleted, that is,
  // whether the step removed its surroundings from the document.
  this.deleted = deleted;
  this.recover = recover;
};

// :: class extends Mappable
// A map describing the deletions and insertions made by a step, which
// can be used to find the correspondence between positions in the
// pre-step version of a document and the same position in the
// post-step version.
var StepMap = function StepMap(ranges, inverted) {
  if ( inverted === void 0 ) inverted = false;

  this.ranges = ranges;
  this.inverted = inverted;
};

StepMap.prototype.recover = function recover (value) {
    var this$1 = this;

  var diff = 0, index = recoverIndex(value);
  if (!this.inverted) { for (var i = 0; i < index; i++)
    { diff += this$1.ranges[i * 3 + 2] - this$1.ranges[i * 3 + 1]; } }
  return this.ranges[index * 3] + diff + recoverOffset(value)
};

// : (number, ?number) → MapResult
StepMap.prototype.mapResult = function mapResult (pos, assoc) {
  if ( assoc === void 0 ) assoc = 1;
 return this._map(pos, assoc, false) };

// : (number, ?number) → number
StepMap.prototype.map = function map (pos, assoc) {
  if ( assoc === void 0 ) assoc = 1;
 return this._map(pos, assoc, true) };

StepMap.prototype._map = function _map (pos, assoc, simple) {
    var this$1 = this;

  var diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
  for (var i = 0; i < this.ranges.length; i += 3) {
    var start = this$1.ranges[i] - (this$1.inverted ? diff : 0);
    if (start > pos) { break }
    var oldSize = this$1.ranges[i + oldIndex], newSize = this$1.ranges[i + newIndex], end = start + oldSize;
    if (pos <= end) {
      var side = !oldSize ? assoc : pos == start ? -1 : pos == end ? 1 : assoc;
      var result = start + diff + (side < 0 ? 0 : newSize);
      if (simple) { return result }
      var recover = makeRecover(i / 3, pos - start);
      return new MapResult(result, assoc < 0 ? pos != start : pos != end, recover)
    }
    diff += newSize - oldSize;
  }
  return simple ? pos + diff : new MapResult(pos + diff)
};

StepMap.prototype.touches = function touches (pos, recover) {
    var this$1 = this;

  var diff = 0, index = recoverIndex(recover);
  var oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
  for (var i = 0; i < this.ranges.length; i += 3) {
    var start = this$1.ranges[i] - (this$1.inverted ? diff : 0);
    if (start > pos) { break }
    var oldSize = this$1.ranges[i + oldIndex], end = start + oldSize;
    if (pos <= end && i == index * 3) { return true }
    diff += this$1.ranges[i + newIndex] - oldSize;
  }
  return false
};

// :: ((oldStart: number, oldEnd: number, newStart: number, newEnd: number))
// Calls the given function on each of the changed ranges included in
// this map.
StepMap.prototype.forEach = function forEach (f) {
    var this$1 = this;

  var oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
  for (var i = 0, diff = 0; i < this.ranges.length; i += 3) {
    var start = this$1.ranges[i], oldStart = start - (this$1.inverted ? diff : 0), newStart = start + (this$1.inverted ? 0 : diff);
    var oldSize = this$1.ranges[i + oldIndex], newSize = this$1.ranges[i + newIndex];
    f(oldStart, oldStart + oldSize, newStart, newStart + newSize);
    diff += newSize - oldSize;
  }
};

// :: () → StepMap
// Create an inverted version of this map. The result can be used to
// map positions in the post-step document to the pre-step document.
StepMap.prototype.invert = function invert () {
  return new StepMap(this.ranges, !this.inverted)
};

StepMap.prototype.toString = function toString () {
  return (this.inverted ? "-" : "") + JSON.stringify(this.ranges)
};

// :: (n: number) → StepMap
// Create a map that moves all positions by offset `n` (which may be
// negative). This can be useful when applying steps meant for a
// sub-document to a larger document, or vice-versa.
StepMap.offset = function offset (n) {
  return n == 0 ? StepMap.empty : new StepMap(n < 0 ? [0, -n, 0] : [0, 0, n])
};

StepMap.empty = new StepMap([]);

// :: class extends Mappable
// A mapping represents a pipeline of zero or more [step
// maps](#transform.StepMap). It has special provisions for losslessly
// handling mapping positions through a series of steps in which some
// steps are inverted versions of earlier steps. (This comes up when
// ‘[rebasing](/docs/guide/#transform.rebasing)’ steps for
// collaboration or history management.)
var Mapping = function Mapping(maps, mirror, from, to) {
  // :: [StepMap]
  // The step maps in this mapping.
  this.maps = maps || [];
  // :: number
  // The starting position in the `maps` array, used when `map` or
  // `mapResult` is called.
  this.from = from || 0;
  // :: number
  // The end position in the `maps` array.
  this.to = to == null ? this.maps.length : to;
  this.mirror = mirror;
};

// :: (?number, ?number) → Mapping
// Create a mapping that maps only through a part of this one.
Mapping.prototype.slice = function slice (from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.maps.length;

  return new Mapping(this.maps, this.mirror, from, to)
};

Mapping.prototype.copy = function copy () {
  return new Mapping(this.maps.slice(), this.mirror && this.mirror.slice(), this.from, this.to)
};

// :: (StepMap, ?number)
// Add a step map to the end of this mapping. If `mirrors` is
// given, it should be the index of the step map that is the mirror
// image of this one.
Mapping.prototype.appendMap = function appendMap (map, mirrors) {
  this.to = this.maps.push(map);
  if (mirrors != null) { this.setMirror(this.maps.length - 1, mirrors); }
};

// :: (Mapping)
// Add all the step maps in a given mapping to this one (preserving
// mirroring information).
Mapping.prototype.appendMapping = function appendMapping (mapping) {
    var this$1 = this;

  for (var i = 0, startSize = this.maps.length; i < mapping.maps.length; i++) {
    var mirr = mapping.getMirror(i);
    this$1.appendMap(mapping.maps[i], mirr != null && mirr < i ? startSize + mirr : null);
  }
};

// :: (number) → ?number
// Finds the offset of the step map that mirrors the map at the
// given offset, in this mapping (as per the second argument to
// `appendMap`).
Mapping.prototype.getMirror = function getMirror (n) {
    var this$1 = this;

  if (this.mirror) { for (var i = 0; i < this.mirror.length; i++)
    { if (this$1.mirror[i] == n) { return this$1.mirror[i + (i % 2 ? -1 : 1)] } } }
};

Mapping.prototype.setMirror = function setMirror (n, m) {
  if (!this.mirror) { this.mirror = []; }
  this.mirror.push(n, m);
};

// :: (Mapping)
// Append the inverse of the given mapping to this one.
Mapping.prototype.appendMappingInverted = function appendMappingInverted (mapping) {
    var this$1 = this;

  for (var i = mapping.maps.length - 1, totalSize = this.maps.length + mapping.maps.length; i >= 0; i--) {
    var mirr = mapping.getMirror(i);
    this$1.appendMap(mapping.maps[i].invert(), mirr != null && mirr > i ? totalSize - mirr - 1 : null);
  }
};

// () → Mapping
// Create an inverted version of this mapping.
Mapping.prototype.invert = function invert () {
  var inverse = new Mapping;
  inverse.appendMappingInverted(this);
  return inverse
};

// : (number, ?number) → number
// Map a position through this mapping.
Mapping.prototype.map = function map (pos, assoc) {
    var this$1 = this;
    if ( assoc === void 0 ) assoc = 1;

  if (this.mirror) { return this._map(pos, assoc, true) }
  for (var i = this.from; i < this.to; i++)
    { pos = this$1.maps[i].map(pos, assoc); }
  return pos
};

// : (number, ?number) → MapResult
// Map a position through this mapping, returning a mapping
// result.
Mapping.prototype.mapResult = function mapResult (pos, assoc) {
  if ( assoc === void 0 ) assoc = 1;
 return this._map(pos, assoc, false) };

Mapping.prototype._map = function _map (pos, assoc, simple) {
    var this$1 = this;

  var deleted = false, recoverables = null;

  for (var i = this.from; i < this.to; i++) {
    var map = this$1.maps[i], rec = recoverables && recoverables[i];
    if (rec != null && map.touches(pos, rec)) {
      pos = map.recover(rec);
      continue
    }

    var result = map.mapResult(pos, assoc);
    if (result.recover != null) {
      var corr = this$1.getMirror(i);
      if (corr != null && corr > i && corr < this$1.to) {
        if (result.deleted) {
          i = corr;
          pos = this$1.maps[corr].recover(result.recover);
          continue
        } else {
          (recoverables || (recoverables = Object.create(null)))[corr] = result.recover;
        }
      }
    }

    if (result.deleted) { deleted = true; }
    pos = result.pos;
  }

  return simple ? pos : new MapResult(pos, deleted)
};

function TransformError(message) {
  var err = Error.call(this, message);
  err.__proto__ = TransformError.prototype;
  return err
}

TransformError.prototype = Object.create(Error.prototype);
TransformError.prototype.constructor = TransformError;
TransformError.prototype.name = "TransformError";

// ::- Abstraction to build up and track an array of
// [steps](#transform.Step) representing a document transformation.
//
// Most transforming methods return the `Transform` object itself, so
// that they can be chained.
var Transform = function Transform(doc) {
  // :: Node
  // The current document (the result of applying the steps in the
  // transform).
  this.doc = doc;
  // :: [Step]
  // The steps in this transform.
  this.steps = [];
  // :: [Node]
  // The documents before each of the steps.
  this.docs = [];
  // :: Mapping
  // A mapping with the maps for each of the steps in this transform.
  this.mapping = new Mapping;
};

var prototypeAccessors = { before: {},docChanged: {} };

// :: Node The starting document.
prototypeAccessors.before.get = function () { return this.docs.length ? this.docs[0] : this.doc };

// :: (step: Step) → this
// Apply a new step in this transform, saving the result. Throws an
// error when the step fails.
Transform.prototype.step = function step (object) {
  var result = this.maybeStep(object);
  if (result.failed) { throw new TransformError(result.failed) }
  return this
};

// :: (Step) → StepResult
// Try to apply a step in this transformation, ignoring it if it
// fails. Returns the step result.
Transform.prototype.maybeStep = function maybeStep (step) {
  var result = step.apply(this.doc);
  if (!result.failed) { this.addStep(step, result.doc); }
  return result
};

// :: bool
// True when the document has been changed (when there are any
// steps).
prototypeAccessors.docChanged.get = function () {
  return this.steps.length > 0
};

Transform.prototype.addStep = function addStep (step, doc) {
  this.docs.push(this.doc);
  this.steps.push(step);
  this.mapping.appendMap(step.getMap());
  this.doc = doc;
};

Object.defineProperties( Transform.prototype, prototypeAccessors );

function mustOverride() { throw new Error("Override me") }

var stepsByID = Object.create(null);

// ::- A step object represents an atomic change. It generally applies
// only to the document it was created for, since the positions
// stored in it will only make sense for that document.
//
// New steps are defined by creating classes that extend `Step`,
// overriding the `apply`, `invert`, `map`, `getMap` and `fromJSON`
// methods, and registering your class with a unique
// JSON-serialization identifier using
// [`Step.jsonID`](#transform.Step^jsonID).
var Step = function Step () {};

Step.prototype.apply = function apply (_doc) { return mustOverride() };

// :: () → StepMap
// Get the step map that represents the changes made by this step,
// and which can be used to transform between positions in the old
// and the new document.
Step.prototype.getMap = function getMap () { return StepMap.empty };

// :: (doc: Node) → Step
// Create an inverted version of this step. Needs the document as it
// was before the step as argument.
Step.prototype.invert = function invert (_doc) { return mustOverride() };

// :: (mapping: Mappable) → ?Step
// Map this step through a mappable thing, returning either a
// version of that step with its positions adjusted, or `null` if
// the step was entirely deleted by the mapping.
Step.prototype.map = function map (_mapping) { return mustOverride() };

// :: (other: Step) → ?Step
// Try to merge this step with another one, to be applied directly
// after it. Returns the merged step when possible, null if the
// steps can't be merged.
Step.prototype.merge = function merge (_other) { return null };

// :: () → Object
// Create a JSON-serializeable representation of this step. When
// defining this for a custom subclass, make sure the result object
// includes the step type's [JSON id](#transform.Step^jsonID) under
// the `stepType` property.
Step.prototype.toJSON = function toJSON () { return mustOverride() };

// :: (Schema, Object) → Step
// Deserialize a step from its JSON representation. Will call
// through to the step class' own implementation of this method.
Step.fromJSON = function fromJSON (schema, json) {
  if (!json || !json.stepType) { throw new RangeError("Invalid input for Step.fromJSON") }
  var type = stepsByID[json.stepType];
  if (!type) { throw new RangeError(("No step type " + (json.stepType) + " defined")) }
  return type.fromJSON(schema, json)
};

// :: (string, constructor<Step>)
// To be able to serialize steps to JSON, each step needs a string
// ID to attach to its JSON representation. Use this method to
// register an ID for your step classes. Try to pick something
// that's unlikely to clash with steps from other modules.
Step.jsonID = function jsonID (id, stepClass) {
  if (id in stepsByID) { throw new RangeError("Duplicate use of step JSON ID " + id) }
  stepsByID[id] = stepClass;
  stepClass.prototype.jsonID = id;
  return stepClass
};

// ::- The result of [applying](#transform.Step.apply) a step. Contains either a
// new document or a failure value.
var StepResult = function StepResult(doc, failed) {
  // :: ?Node The transformed document.
  this.doc = doc;
  // :: ?string Text providing information about a failed step.
  this.failed = failed;
};

// :: (Node) → StepResult
// Create a successful step result.
StepResult.ok = function ok (doc) { return new StepResult(doc, null) };

// :: (string) → StepResult
// Create a failed step result.
StepResult.fail = function fail (message) { return new StepResult(null, message) };

// :: (Node, number, number, Slice) → StepResult
// Call [`Node.replace`](#model.Node.replace) with the given
// arguments. Create a successful result if it succeeds, and a
// failed one if it throws a `ReplaceError`.
StepResult.fromReplace = function fromReplace (doc, from, to, slice) {
  try {
    return StepResult.ok(doc.replace(from, to, slice))
  } catch (e) {
    if (e instanceof prosemirrorModel.ReplaceError) { return StepResult.fail(e.message) }
    throw e
  }
};

// ::- Replace a part of the document with a slice of new content.
var ReplaceStep = (function (Step$$1) {
  function ReplaceStep(from, to, slice, structure) {
    Step$$1.call(this);
    this.from = from;
    this.to = to;
    this.slice = slice;
    this.structure = !!structure;
  }

  if ( Step$$1 ) ReplaceStep.__proto__ = Step$$1;
  ReplaceStep.prototype = Object.create( Step$$1 && Step$$1.prototype );
  ReplaceStep.prototype.constructor = ReplaceStep;

  ReplaceStep.prototype.apply = function apply (doc) {
    if (this.structure && contentBetween(doc, this.from, this.to))
      { return StepResult.fail("Structure replace would overwrite content") }
    return StepResult.fromReplace(doc, this.from, this.to, this.slice)
  };

  ReplaceStep.prototype.getMap = function getMap () {
    return new StepMap([this.from, this.to - this.from, this.slice.size])
  };

  ReplaceStep.prototype.invert = function invert (doc) {
    return new ReplaceStep(this.from, this.from + this.slice.size, doc.slice(this.from, this.to))
  };

  ReplaceStep.prototype.map = function map (mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
    if (from.deleted && to.deleted) { return null }
    return new ReplaceStep(from.pos, Math.max(from.pos, to.pos), this.slice)
  };

  ReplaceStep.prototype.merge = function merge (other) {
    if (!(other instanceof ReplaceStep) || other.structure != this.structure) { return null }

    if (this.from + this.slice.size == other.from && !this.slice.openEnd && !other.slice.openStart) {
      var slice = this.slice.size + other.slice.size == 0 ? prosemirrorModel.Slice.empty
          : new prosemirrorModel.Slice(this.slice.content.append(other.slice.content), this.slice.openStart, other.slice.openEnd);
      return new ReplaceStep(this.from, this.to + (other.to - other.from), slice, this.structure)
    } else if (other.to == this.from && !this.slice.openStart && !other.slice.openEnd) {
      var slice$1 = this.slice.size + other.slice.size == 0 ? prosemirrorModel.Slice.empty
          : new prosemirrorModel.Slice(other.slice.content.append(this.slice.content), other.slice.openStart, this.slice.openEnd);
      return new ReplaceStep(other.from, this.to, slice$1, this.structure)
    } else {
      return null
    }
  };

  ReplaceStep.prototype.toJSON = function toJSON () {
    var json = {stepType: "replace", from: this.from, to: this.to};
    if (this.slice.size) { json.slice = this.slice.toJSON(); }
    if (this.structure) { json.structure = true; }
    return json
  };

  ReplaceStep.fromJSON = function fromJSON (schema, json) {
    if (typeof json.from != "number" || typeof json.to != "number")
      { throw new RangeError("Invalid input for ReplaceStep.fromJSON") }
    return new ReplaceStep(json.from, json.to, prosemirrorModel.Slice.fromJSON(schema, json.slice), !!json.structure)
  };

  return ReplaceStep;
}(Step));

Step.jsonID("replace", ReplaceStep);

// ::- Replace a part of the document with a slice of content, but
// preserve a range of the replaced content by moving it into the
// slice.
var ReplaceAroundStep = (function (Step$$1) {
  function ReplaceAroundStep(from, to, gapFrom, gapTo, slice, insert, structure) {
    Step$$1.call(this);
    this.from = from;
    this.to = to;
    this.gapFrom = gapFrom;
    this.gapTo = gapTo;
    this.slice = slice;
    this.insert = insert;
    this.structure = !!structure;
  }

  if ( Step$$1 ) ReplaceAroundStep.__proto__ = Step$$1;
  ReplaceAroundStep.prototype = Object.create( Step$$1 && Step$$1.prototype );
  ReplaceAroundStep.prototype.constructor = ReplaceAroundStep;

  ReplaceAroundStep.prototype.apply = function apply (doc) {
    if (this.structure && (contentBetween(doc, this.from, this.gapFrom) ||
                           contentBetween(doc, this.gapTo, this.to)))
      { return StepResult.fail("Structure gap-replace would overwrite content") }

    var gap = doc.slice(this.gapFrom, this.gapTo);
    if (gap.openStart || gap.openEnd)
      { return StepResult.fail("Gap is not a flat range") }
    var inserted = this.slice.insertAt(this.insert, gap.content);
    if (!inserted) { return StepResult.fail("Content does not fit in gap") }
    return StepResult.fromReplace(doc, this.from, this.to, inserted)
  };

  ReplaceAroundStep.prototype.getMap = function getMap () {
    return new StepMap([this.from, this.gapFrom - this.from, this.insert,
                        this.gapTo, this.to - this.gapTo, this.slice.size - this.insert])
  };

  ReplaceAroundStep.prototype.invert = function invert (doc) {
    var gap = this.gapTo - this.gapFrom;
    return new ReplaceAroundStep(this.from, this.from + this.slice.size + gap,
                                 this.from + this.insert, this.from + this.insert + gap,
                                 doc.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from),
                                 this.gapFrom - this.from, this.structure)
  };

  ReplaceAroundStep.prototype.map = function map (mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
    var gapFrom = mapping.map(this.gapFrom, -1), gapTo = mapping.map(this.gapTo, 1);
    if ((from.deleted && to.deleted) || gapFrom < from.pos || gapTo > to.pos) { return null }
    return new ReplaceAroundStep(from.pos, to.pos, gapFrom, gapTo, this.slice, this.insert, this.structure)
  };

  ReplaceAroundStep.prototype.toJSON = function toJSON () {
    var json = {stepType: "replaceAround", from: this.from, to: this.to,
                gapFrom: this.gapFrom, gapTo: this.gapTo, insert: this.insert};
    if (this.slice.size) { json.slice = this.slice.toJSON(); }
    if (this.structure) { json.structure = true; }
    return json
  };

  ReplaceAroundStep.fromJSON = function fromJSON (schema, json) {
    if (typeof json.from != "number" || typeof json.to != "number" ||
        typeof json.gapFrom != "number" || typeof json.gapTo != "number" || typeof json.insert != "number")
      { throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON") }
    return new ReplaceAroundStep(json.from, json.to, json.gapFrom, json.gapTo,
                                 prosemirrorModel.Slice.fromJSON(schema, json.slice), json.insert, !!json.structure)
  };

  return ReplaceAroundStep;
}(Step));

Step.jsonID("replaceAround", ReplaceAroundStep);

function contentBetween(doc, from, to) {
  var $from = doc.resolve(from), dist = to - from, depth = $from.depth;
  while (dist > 0 && depth > 0 && $from.indexAfter(depth) == $from.node(depth).childCount) {
    depth--;
    dist--;
  }
  if (dist > 0) {
    var next = $from.node(depth).maybeChild($from.indexAfter(depth));
    while (dist > 0) {
      if (!next || next.isLeaf) { return true }
      next = next.firstChild;
      dist--;
    }
  }
  return false
}

function canCut(node, start, end) {
  return (start == 0 || node.canReplace(start, node.childCount)) &&
    (end == node.childCount || node.canReplace(0, end))
}

// :: (NodeRange) → ?number
// Try to find a target depth to which the content in the given range
// can be lifted. Will not go across
// [isolating](#model.NodeSpec.isolating) parent nodes.
function liftTarget(range) {
  var parent = range.parent;
  var content = parent.content.cutByIndex(range.startIndex, range.endIndex);
  for (var depth = range.depth;; --depth) {
    var node = range.$from.node(depth);
    var index = range.$from.index(depth), endIndex = range.$to.indexAfter(depth);
    if (depth < range.depth && node.canReplace(index, endIndex, content))
      { return depth }
    if (depth == 0 || node.type.spec.isolating || !canCut(node, index, endIndex)) { break }
  }
}

// :: (NodeRange, number) → this
// Split the content in the given range off from its parent, if there
// is sibling content before or after it, and move it up the tree to
// the depth specified by `target`. You'll probably want to use
// [`liftTarget`](#transform.liftTarget) to compute `target`, to make
// sure the lift is valid.
Transform.prototype.lift = function(range, target) {
  var $from = range.$from;
  var $to = range.$to;
  var depth = range.depth;

  var gapStart = $from.before(depth + 1), gapEnd = $to.after(depth + 1);
  var start = gapStart, end = gapEnd;

  var before = prosemirrorModel.Fragment.empty, openStart = 0;
  for (var d = depth, splitting = false; d > target; d--)
    { if (splitting || $from.index(d) > 0) {
      splitting = true;
      before = prosemirrorModel.Fragment.from($from.node(d).copy(before));
      openStart++;
    } else {
      start--;
    } }
  var after = prosemirrorModel.Fragment.empty, openEnd = 0;
  for (var d$1 = depth, splitting$1 = false; d$1 > target; d$1--)
    { if (splitting$1 || $to.after(d$1 + 1) < $to.end(d$1)) {
      splitting$1 = true;
      after = prosemirrorModel.Fragment.from($to.node(d$1).copy(after));
      openEnd++;
    } else {
      end++;
    } }

  return this.step(new ReplaceAroundStep(start, end, gapStart, gapEnd,
                                         new prosemirrorModel.Slice(before.append(after), openStart, openEnd),
                                         before.size - openStart, true))
};

// :: (NodeRange, NodeType, ?Object, ?NodeRange) → ?[{type: NodeType, attrs: ?Object}]
// Try to find a valid way to wrap the content in the given range in a
// node of the given type. May introduce extra nodes around and inside
// the wrapper node, if necessary. Returns null if no valid wrapping
// could be found. When `innerRange` is given, that range's content is
// used as the content to fit into the wrapping, instead of the
// content of `range`.
function findWrapping(range, nodeType, attrs, innerRange) {
  if ( innerRange === void 0 ) innerRange = range;

  var around = findWrappingOutside(range, nodeType);
  var inner = around && findWrappingInside(innerRange, nodeType);
  if (!inner) { return null }
  return around.map(withAttrs).concat({type: nodeType, attrs: attrs}).concat(inner.map(withAttrs))
}

function withAttrs(type) { return {type: type, attrs: null} }

function findWrappingOutside(range, type) {
  var parent = range.parent;
  var startIndex = range.startIndex;
  var endIndex = range.endIndex;
  var around = parent.contentMatchAt(startIndex).findWrapping(type);
  if (!around) { return null }
  var outer = around.length ? around[0] : type;
  return parent.canReplaceWith(startIndex, endIndex, outer) ? around : null
}

function findWrappingInside(range, type) {
  var parent = range.parent;
  var startIndex = range.startIndex;
  var endIndex = range.endIndex;
  var inner = parent.child(startIndex);
  var inside = type.contentMatch.findWrapping(inner.type);
  if (!inside) { return null }
  var lastType = inside.length ? inside[inside.length - 1] : type;
  var innerMatch = lastType.contentMatch;
  for (var i = startIndex; innerMatch && i < endIndex; i++)
    { innerMatch = innerMatch.matchType(parent.child(i).type); }
  if (!innerMatch || !innerMatch.validEnd) { return null }
  return inside
}

// :: (NodeRange, [{type: NodeType, attrs: ?Object}]) → this
// Wrap the given [range](#model.NodeRange) in the given set of wrappers.
// The wrappers are assumed to be valid in this position, and should
// probably be computed with [`findWrapping`](#transform.findWrapping).
Transform.prototype.wrap = function(range, wrappers) {
  var content = prosemirrorModel.Fragment.empty;
  for (var i = wrappers.length - 1; i >= 0; i--)
    { content = prosemirrorModel.Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content)); }

  var start = range.start, end = range.end;
  return this.step(new ReplaceAroundStep(start, end, start, end, new prosemirrorModel.Slice(content, 0, 0), wrappers.length, true))
};

// :: (number, ?number, NodeType, ?Object) → this
// Set the type of all textblocks (partly) between `from` and `to` to
// the given node type with the given attributes.
Transform.prototype.setBlockType = function(from, to, type, attrs) {
  var this$1 = this;
  if ( to === void 0 ) to = from;

  if (!type.isTextblock) { throw new RangeError("Type given to setBlockType should be a textblock") }
  var mapFrom = this.steps.length;
  this.doc.nodesBetween(from, to, function (node, pos) {
    if (node.isTextblock && !node.hasMarkup(type, attrs) && canChangeType(this$1.doc, this$1.mapping.slice(mapFrom).map(pos), type)) {
      // Ensure all markup that isn't allowed in the new node type is cleared
      this$1.clearIncompatible(this$1.mapping.slice(mapFrom).map(pos, 1), type);
      var mapping = this$1.mapping.slice(mapFrom);
      var startM = mapping.map(pos, 1), endM = mapping.map(pos + node.nodeSize, 1);
      this$1.step(new ReplaceAroundStep(startM, endM, startM + 1, endM - 1,
                                      new prosemirrorModel.Slice(prosemirrorModel.Fragment.from(type.create(attrs, null, node.marks)), 0, 0), 1, true));
      return false
    }
  });
  return this
};

function canChangeType(doc, pos, type) {
  var $pos = doc.resolve(pos), index = $pos.index();
  return $pos.parent.canReplaceWith(index, index + 1, type)
}

// :: (number, ?NodeType, ?Object, ?[Mark]) → this
// Change the type, attributes, and/or marks of the node at `pos`.
// When `type` isn't given, the existing node type is preserved,
Transform.prototype.setNodeMarkup = function(pos, type, attrs, marks) {
  var node = this.doc.nodeAt(pos);
  if (!node) { throw new RangeError("No node at given position") }
  if (!type) { type = node.type; }
  var newNode = type.create(attrs, null, marks || node.marks);
  if (node.isLeaf)
    { return this.replaceWith(pos, pos + node.nodeSize, newNode) }

  if (!type.validContent(node.content))
    { throw new RangeError("Invalid content for node type " + type.name) }

  return this.step(new ReplaceAroundStep(pos, pos + node.nodeSize, pos + 1, pos + node.nodeSize - 1,
                                         new prosemirrorModel.Slice(prosemirrorModel.Fragment.from(newNode), 0, 0), 1, true))
};

// :: (Node, number, number, ?[?{type: NodeType, attrs: ?Object}]) → bool
// Check whether splitting at the given position is allowed.
function canSplit(doc, pos, depth, typesAfter) {
  if ( depth === void 0 ) depth = 1;

  var $pos = doc.resolve(pos), base = $pos.depth - depth;
  var innerType = (typesAfter && typesAfter[typesAfter.length - 1]) || $pos.parent;
  if (base < 0 || $pos.parent.type.spec.isolating ||
      !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) ||
      !innerType.type.validContent($pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount)))
    { return false }
  for (var d = $pos.depth - 1, i = depth - 2; d > base; d--, i--) {
    var node = $pos.node(d), index$1 = $pos.index(d);
    if (node.type.spec.isolating) { return false }
    var rest = node.content.cutByIndex(index$1, node.childCount);
    var after = (typesAfter && typesAfter[i]) || node;
    if (after != node) { rest = rest.replaceChild(0, after.type.create(after.attrs)); }
    if (!node.canReplace(index$1 + 1, node.childCount) || !after.type.validContent(rest))
      { return false }
  }
  var index = $pos.indexAfter(base);
  var baseType = typesAfter && typesAfter[0];
  return $pos.node(base).canReplaceWith(index, index, baseType ? baseType.type : $pos.node(base + 1).type)
}

// :: (number, ?number, ?[?{type: NodeType, attrs: ?Object}]) → this
// Split the node at the given position, and optionally, if `depth` is
// greater than one, any number of nodes above that. By default, the
// parts split off will inherit the node type of the original node.
// This can be changed by passing an array of types and attributes to
// use after the split.
Transform.prototype.split = function(pos, depth, typesAfter) {
  if ( depth === void 0 ) depth = 1;

  var $pos = this.doc.resolve(pos), before = prosemirrorModel.Fragment.empty, after = prosemirrorModel.Fragment.empty;
  for (var d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
    before = prosemirrorModel.Fragment.from($pos.node(d).copy(before));
    var typeAfter = typesAfter && typesAfter[i];
    after = prosemirrorModel.Fragment.from(typeAfter ? typeAfter.type.create(typeAfter.attrs, after) : $pos.node(d).copy(after));
  }
  return this.step(new ReplaceStep(pos, pos, new prosemirrorModel.Slice(before.append(after), depth, depth, true)))
};

// :: (Node, number) → bool
// Test whether the blocks before and after a given position can be
// joined.
function canJoin(doc, pos) {
  var $pos = doc.resolve(pos), index = $pos.index();
  return joinable($pos.nodeBefore, $pos.nodeAfter) &&
    $pos.parent.canReplace(index, index + 1)
}

function joinable(a, b) {
  return a && b && !a.isLeaf && a.canAppend(b)
}

// :: (Node, number, ?number) → ?number
// Find an ancestor of the given position that can be joined to the
// block before (or after if `dir` is positive). Returns the joinable
// point, if any.
function joinPoint(doc, pos, dir) {
  if ( dir === void 0 ) dir = -1;

  var $pos = doc.resolve(pos);
  for (var d = $pos.depth;; d--) {
    var before = (void 0), after = (void 0);
    if (d == $pos.depth) {
      before = $pos.nodeBefore;
      after = $pos.nodeAfter;
    } else if (dir > 0) {
      before = $pos.node(d + 1);
      after = $pos.node(d).maybeChild($pos.index(d) + 1);
    } else {
      before = $pos.node(d).maybeChild($pos.index(d) - 1);
      after = $pos.node(d + 1);
    }
    if (before && !before.isTextblock && joinable(before, after)) { return pos }
    if (d == 0) { break }
    pos = dir < 0 ? $pos.before(d) : $pos.after(d);
  }
}

// :: (number, ?number) → this
// Join the blocks around the given position. If depth is 2, their
// last and first siblings are also joined, and so on.
Transform.prototype.join = function(pos, depth) {
  if ( depth === void 0 ) depth = 1;

  var step = new ReplaceStep(pos - depth, pos + depth, prosemirrorModel.Slice.empty, true);
  return this.step(step)
};

// :: (Node, number, NodeType) → ?number
// Try to find a point where a node of the given type can be inserted
// near `pos`, by searching up the node hierarchy when `pos` itself
// isn't a valid place but is at the start or end of a node. Return
// null if no position was found.
function insertPoint(doc, pos, nodeType) {
  var $pos = doc.resolve(pos);
  if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType)) { return pos }

  if ($pos.parentOffset == 0)
    { for (var d = $pos.depth - 1; d >= 0; d--) {
      var index = $pos.index(d);
      if ($pos.node(d).canReplaceWith(index, index, nodeType)) { return $pos.before(d + 1) }
      if (index > 0) { return null }
    } }
  if ($pos.parentOffset == $pos.parent.content.size)
    { for (var d$1 = $pos.depth - 1; d$1 >= 0; d$1--) {
      var index$1 = $pos.indexAfter(d$1);
      if ($pos.node(d$1).canReplaceWith(index$1, index$1, nodeType)) { return $pos.after(d$1 + 1) }
      if (index$1 < $pos.node(d$1).childCount) { return null }
    } }
}

// :: (Node, number, Slice) → ?number
// Finds a position at or around the given position where the given
// slice can be inserted. Will look at parent nodes' nearest boundary
// and try there, even if the original position wasn't directly at the
// start or end of that node. Returns null when no position was found.
function dropPoint(doc, pos, slice) {
  var $pos = doc.resolve(pos);
  if (!slice.content.size) { return pos }
  var content = slice.content;
  for (var i = 0; i < slice.openStart; i++) { content = content.firstChild.content; }
  for (var pass = 1; pass <= (slice.openStart == 0 && slice.size ? 2 : 1); pass++) {
    for (var d = $pos.depth; d >= 0; d--) {
      var bias = d == $pos.depth ? 0 : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? -1 : 1;
      var insertPos = $pos.index(d) + (bias > 0 ? 1 : 0);
      if (pass == 1
          ? $pos.node(d).canReplace(insertPos, insertPos, content)
          : $pos.node(d).contentMatchAt(insertPos).findWrapping(content.firstChild.type))
        { return bias == 0 ? $pos.pos : bias < 0 ? $pos.before(d + 1) : $pos.after(d + 1) }
    }
  }
  return null
}

function mapFragment(fragment, f, parent) {
  var mapped = [];
  for (var i = 0; i < fragment.childCount; i++) {
    var child = fragment.child(i);
    if (child.content.size) { child = child.copy(mapFragment(child.content, f, child)); }
    if (child.isInline) { child = f(child, parent, i); }
    mapped.push(child);
  }
  return prosemirrorModel.Fragment.fromArray(mapped)
}

// ::- Add a mark to all inline content between two positions.
var AddMarkStep = (function (Step$$1) {
  function AddMarkStep(from, to, mark) {
    Step$$1.call(this);
    this.from = from;
    this.to = to;
    this.mark = mark;
  }

  if ( Step$$1 ) AddMarkStep.__proto__ = Step$$1;
  AddMarkStep.prototype = Object.create( Step$$1 && Step$$1.prototype );
  AddMarkStep.prototype.constructor = AddMarkStep;

  AddMarkStep.prototype.apply = function apply (doc) {
    var this$1 = this;

    var oldSlice = doc.slice(this.from, this.to), $from = doc.resolve(this.from);
    var parent = $from.node($from.sharedDepth(this.to));
    var slice = new prosemirrorModel.Slice(mapFragment(oldSlice.content, function (node, parent) {
      if (!parent.type.allowsMarkType(this$1.mark.type)) { return node }
      return node.mark(this$1.mark.addToSet(node.marks))
    }, parent), oldSlice.openStart, oldSlice.openEnd);
    return StepResult.fromReplace(doc, this.from, this.to, slice)
  };

  AddMarkStep.prototype.invert = function invert () {
    return new RemoveMarkStep(this.from, this.to, this.mark)
  };

  AddMarkStep.prototype.map = function map (mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
    if (from.deleted && to.deleted || from.pos >= to.pos) { return null }
    return new AddMarkStep(from.pos, to.pos, this.mark)
  };

  AddMarkStep.prototype.merge = function merge (other) {
    if (other instanceof AddMarkStep &&
        other.mark.eq(this.mark) &&
        this.from <= other.to && this.to >= other.from)
      { return new AddMarkStep(Math.min(this.from, other.from),
                             Math.max(this.to, other.to), this.mark) }
  };

  AddMarkStep.prototype.toJSON = function toJSON () {
    return {stepType: "addMark", mark: this.mark.toJSON(),
            from: this.from, to: this.to}
  };

  AddMarkStep.fromJSON = function fromJSON (schema, json) {
    if (typeof json.from != "number" || typeof json.to != "number")
      { throw new RangeError("Invalid input for AddMarkStep.fromJSON") }
    return new AddMarkStep(json.from, json.to, schema.markFromJSON(json.mark))
  };

  return AddMarkStep;
}(Step));

Step.jsonID("addMark", AddMarkStep);

// ::- Remove a mark from all inline content between two positions.
var RemoveMarkStep = (function (Step$$1) {
  function RemoveMarkStep(from, to, mark) {
    Step$$1.call(this);
    this.from = from;
    this.to = to;
    this.mark = mark;
  }

  if ( Step$$1 ) RemoveMarkStep.__proto__ = Step$$1;
  RemoveMarkStep.prototype = Object.create( Step$$1 && Step$$1.prototype );
  RemoveMarkStep.prototype.constructor = RemoveMarkStep;

  RemoveMarkStep.prototype.apply = function apply (doc) {
    var this$1 = this;

    var oldSlice = doc.slice(this.from, this.to);
    var slice = new prosemirrorModel.Slice(mapFragment(oldSlice.content, function (node) {
      return node.mark(this$1.mark.removeFromSet(node.marks))
    }), oldSlice.openStart, oldSlice.openEnd);
    return StepResult.fromReplace(doc, this.from, this.to, slice)
  };

  RemoveMarkStep.prototype.invert = function invert () {
    return new AddMarkStep(this.from, this.to, this.mark)
  };

  RemoveMarkStep.prototype.map = function map (mapping) {
    var from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
    if (from.deleted && to.deleted || from.pos >= to.pos) { return null }
    return new RemoveMarkStep(from.pos, to.pos, this.mark)
  };

  RemoveMarkStep.prototype.merge = function merge (other) {
    if (other instanceof RemoveMarkStep &&
        other.mark.eq(this.mark) &&
        this.from <= other.to && this.to >= other.from)
      { return new RemoveMarkStep(Math.min(this.from, other.from),
                                Math.max(this.to, other.to), this.mark) }
  };

  RemoveMarkStep.prototype.toJSON = function toJSON () {
    return {stepType: "removeMark", mark: this.mark.toJSON(),
            from: this.from, to: this.to}
  };

  RemoveMarkStep.fromJSON = function fromJSON (schema, json) {
    if (typeof json.from != "number" || typeof json.to != "number")
      { throw new RangeError("Invalid input for RemoveMarkStep.fromJSON") }
    return new RemoveMarkStep(json.from, json.to, schema.markFromJSON(json.mark))
  };

  return RemoveMarkStep;
}(Step));

Step.jsonID("removeMark", RemoveMarkStep);

// :: (number, number, Mark) → this
// Add the given mark to the inline content between `from` and `to`.
Transform.prototype.addMark = function(from, to, mark) {
  var this$1 = this;

  var removed = [], added = [], removing = null, adding = null;
  this.doc.nodesBetween(from, to, function (node, pos, parent) {
    if (!node.isInline) { return }
    var marks = node.marks;
    if (!mark.isInSet(marks) && parent.type.allowsMarkType(mark.type)) {
      var start = Math.max(pos, from), end = Math.min(pos + node.nodeSize, to);
      var newSet = mark.addToSet(marks);

      for (var i = 0; i < marks.length; i++) {
        if (!marks[i].isInSet(newSet)) {
          if (removing && removing.to == start && removing.mark.eq(marks[i]))
            { removing.to = end; }
          else
            { removed.push(removing = new RemoveMarkStep(start, end, marks[i])); }
        }
      }

      if (adding && adding.to == start)
        { adding.to = end; }
      else
        { added.push(adding = new AddMarkStep(start, end, mark)); }
    }
  });

  removed.forEach(function (s) { return this$1.step(s); });
  added.forEach(function (s) { return this$1.step(s); });
  return this
};

// :: (number, number, ?union<Mark, MarkType>) → this
// Remove marks from inline nodes between `from` and `to`. When `mark`
// is a single mark, remove precisely that mark. When it is a mark type,
// remove all marks of that type. When it is null, remove all marks of
// any type.
Transform.prototype.removeMark = function(from, to, mark) {
  var this$1 = this;
  if ( mark === void 0 ) mark = null;

  var matched = [], step = 0;
  this.doc.nodesBetween(from, to, function (node, pos) {
    if (!node.isInline) { return }
    step++;
    var toRemove = null;
    if (mark instanceof prosemirrorModel.MarkType) {
      var found = mark.isInSet(node.marks);
      if (found) { toRemove = [found]; }
    } else if (mark) {
      if (mark.isInSet(node.marks)) { toRemove = [mark]; }
    } else {
      toRemove = node.marks;
    }
    if (toRemove && toRemove.length) {
      var end = Math.min(pos + node.nodeSize, to);
      for (var i = 0; i < toRemove.length; i++) {
        var style = toRemove[i], found$1 = (void 0);
        for (var j = 0; j < matched.length; j++) {
          var m = matched[j];
          if (m.step == step - 1 && style.eq(matched[j].style)) { found$1 = m; }
        }
        if (found$1) {
          found$1.to = end;
          found$1.step = step;
        } else {
          matched.push({style: style, from: Math.max(pos, from), to: end, step: step});
        }
      }
    }
  });
  matched.forEach(function (m) { return this$1.step(new RemoveMarkStep(m.from, m.to, m.style)); });
  return this
};

// :: (number, NodeType, ?ContentMatch) → this
// Removes all marks and nodes from the content of the node at `pos`
// that don't match the given new parent node type. Accepts an
// optional starting [content match](#model.ContentMatch) as third
// argument.
Transform.prototype.clearIncompatible = function(pos, parentType, match) {
  var this$1 = this;
  if ( match === void 0 ) match = parentType.contentMatch;

  var node = this.doc.nodeAt(pos);
  var delSteps = [], cur = pos + 1;
  for (var i = 0; i < node.childCount; i++) {
    var child = node.child(i), end = cur + child.nodeSize;
    var allowed = match.matchType(child.type, child.attrs);
    if (!allowed) {
      delSteps.push(new ReplaceStep(cur, end, prosemirrorModel.Slice.empty));
    } else {
      match = allowed;
      for (var j = 0; j < child.marks.length; j++) { if (!parentType.allowsMarkType(child.marks[j].type))
        { this$1.step(new RemoveMarkStep(cur, end, child.marks[j])); } }
    }
    cur = end;
  }
  if (!match.validEnd) {
    var fill = match.fillBefore(prosemirrorModel.Fragment.empty, true);
    this.replace(cur, cur, new prosemirrorModel.Slice(fill, 0, 0));
  }
  for (var i$1 = delSteps.length - 1; i$1 >= 0; i$1--) { this$1.step(delSteps[i$1]); }
  return this
};

// :: (Node, number, ?number, ?Slice) → ?Step
// ‘Fit’ a slice into a given position in the document, producing a
// [step](#transform.Step) that inserts it. Will return null if
// there's no meaningful way to insert the slice here, or inserting it
// would be a no-op (an empty slice over an empty range).
function replaceStep(doc, from, to, slice) {
  if ( to === void 0 ) to = from;
  if ( slice === void 0 ) slice = prosemirrorModel.Slice.empty;

  if (from == to && !slice.size) { return null }

  var $from = doc.resolve(from), $to = doc.resolve(to);
  // Optimization -- avoid work if it's obvious that it's not needed.
  if (fitsTrivially($from, $to, slice)) { return new ReplaceStep(from, to, slice) }
  var placed = placeSlice($from, slice);

  var fittedLeft = fitLeft($from, placed);
  var fitted = fitRight($from, $to, fittedLeft);
  if (!fitted) { return null }
  if (fittedLeft.size != fitted.size && canMoveText($from, $to, fittedLeft)) {
    var d = $to.depth, after = $to.after(d);
    while (d > 1 && after == $to.end(--d)) { ++after; }
    var fittedAfter = fitRight($from, doc.resolve(after), fittedLeft);
    if (fittedAfter)
      { return new ReplaceAroundStep(from, after, to, $to.end(), fittedAfter, fittedLeft.size) }
  }
  return fitted.size || from != to ? new ReplaceStep(from, to, fitted) : null
}

// :: (number, ?number, ?Slice) → this
// Replace the part of the document between `from` and `to` with the
// given `slice`.
Transform.prototype.replace = function(from, to, slice) {
  if ( to === void 0 ) to = from;
  if ( slice === void 0 ) slice = prosemirrorModel.Slice.empty;

  var step = replaceStep(this.doc, from, to, slice);
  if (step) { this.step(step); }
  return this
};

// :: (number, number, union<Fragment, Node, [Node]>) → this
// Replace the given range with the given content, which may be a
// fragment, node, or array of nodes.
Transform.prototype.replaceWith = function(from, to, content) {
  return this.replace(from, to, new prosemirrorModel.Slice(prosemirrorModel.Fragment.from(content), 0, 0))
};

// :: (number, number) → this
// Delete the content between the given positions.
Transform.prototype.delete = function(from, to) {
  return this.replace(from, to, prosemirrorModel.Slice.empty)
};

// :: (number, union<Fragment, Node, [Node]>) → this
// Insert the given content at the given position.
Transform.prototype.insert = function(pos, content) {
  return this.replaceWith(pos, pos, content)
};



function fitLeftInner($from, depth, placed, placedBelow) {
  var content = prosemirrorModel.Fragment.empty, openEnd = 0, placedHere = placed[depth];
  if ($from.depth > depth) {
    var inner = fitLeftInner($from, depth + 1, placed, placedBelow || placedHere);
    openEnd = inner.openEnd + 1;
    content = prosemirrorModel.Fragment.from($from.node(depth + 1).copy(inner.content));
  }

  if (placedHere) {
    content = content.append(placedHere.content);
    openEnd = placedHere.openEnd;
  }
  if (placedBelow) {
    content = content.append($from.node(depth).contentMatchAt($from.indexAfter(depth)).fillBefore(prosemirrorModel.Fragment.empty, true));
    openEnd = 0;
  }

  return {content: content, openEnd: openEnd}
}

function fitLeft($from, placed) {
  var ref = fitLeftInner($from, 0, placed, false);
  var content = ref.content;
  var openEnd = ref.openEnd;
  return new prosemirrorModel.Slice(content, $from.depth, openEnd || 0)
}

function fitRightJoin(content, parent, $from, $to, depth, openStart, openEnd) {
  var match, count = content.childCount, matchCount = count - (openEnd > 0 ? 1 : 0);
  var parentNode = openStart < 0 ? parent : $from.node(depth);
  if (openStart < 0)
    { match = parentNode.contentMatchAt(matchCount); }
  else if (count == 1 && openEnd > 0)
    { match = parentNode.contentMatchAt(openStart ? $from.index(depth) : $from.indexAfter(depth)); }
  else
    { match = parentNode.contentMatchAt($from.indexAfter(depth))
      .matchFragment(content, count > 0 && openStart ? 1 : 0, matchCount); }

  var toNode = $to.node(depth);
  if (openEnd > 0 && depth < $to.depth) {
    var after = toNode.content.cutByIndex($to.indexAfter(depth)).addToStart(content.lastChild);
    var joinable$1 = match.fillBefore(after, true);
    // Can't insert content if there's a single node stretched across this gap
    if (joinable$1 && joinable$1.size && openStart > 0 && count == 1) { joinable$1 = null; }

    if (joinable$1) {
      var inner = fitRightJoin(content.lastChild.content, content.lastChild, $from, $to,
                               depth + 1, count == 1 ? openStart - 1 : -1, openEnd - 1);
      if (inner) {
        var last = content.lastChild.copy(inner);
        if (joinable$1.size)
          { return content.cutByIndex(0, count - 1).append(joinable$1).addToEnd(last) }
        else
          { return content.replaceChild(count - 1, last) }
      }
    }
  }
  if (openEnd > 0)
    { match = match.matchType((count == 1 && openStart > 0 ? $from.node(depth + 1) : content.lastChild).type); }

  // If we're here, the next level can't be joined, so we see what
  // happens if we leave it open.
  var toIndex = $to.index(depth);
  if (toIndex == toNode.childCount && !toNode.type.compatibleContent(parent.type)) { return null }
  var joinable = match.fillBefore(toNode.content, true, toIndex);
  for (var i = toIndex; joinable && i < toNode.content.childCount; i++)
    { if (!parentNode.type.allowsMarks(toNode.content.child(i).marks)) { joinable = null; } }
  if (!joinable) { return null }

  if (openEnd > 0) {
    var closed = fitRightClosed(content.lastChild, openEnd - 1, $from, depth + 1,
                                count == 1 ? openStart - 1 : -1);
    content = content.replaceChild(count - 1, closed);
  }
  content = content.append(joinable);
  if ($to.depth > depth)
    { content = content.addToEnd(fitRightSeparate($to, depth + 1)); }
  return content
}

function fitRightClosed(node, openEnd, $from, depth, openStart) {
  var match, content = node.content, count = content.childCount;
  if (openStart >= 0)
    { match = $from.node(depth).contentMatchAt($from.indexAfter(depth))
      .matchFragment(content, openStart > 0 ? 1 : 0, count); }
  else
    { match = node.contentMatchAt(count); }

  if (openEnd > 0) {
    var closed = fitRightClosed(content.lastChild, openEnd - 1, $from, depth + 1,
                                count == 1 ? openStart - 1 : -1);
    content = content.replaceChild(count - 1, closed);
  }

  return node.copy(content.append(match.fillBefore(prosemirrorModel.Fragment.empty, true)))
}

function fitRightSeparate($to, depth) {
  var node = $to.node(depth);
  var fill = node.contentMatchAt(0).fillBefore(node.content, true, $to.index(depth));
  if ($to.depth > depth) { fill = fill.addToEnd(fitRightSeparate($to, depth + 1)); }
  return node.copy(fill)
}

function normalizeSlice(content, openStart, openEnd) {
  while (openStart > 0 && openEnd > 0 && content.childCount == 1) {
    content = content.firstChild.content;
    openStart--;
    openEnd--;
  }
  return new prosemirrorModel.Slice(content, openStart, openEnd)
}

// : (ResolvedPos, ResolvedPos, number, Slice) → Slice
function fitRight($from, $to, slice) {
  var fitted = fitRightJoin(slice.content, $from.node(0), $from, $to, 0, slice.openStart, slice.openEnd);
  if (!fitted) { return null }
  return normalizeSlice(fitted, slice.openStart, $to.depth)
}

function fitsTrivially($from, $to, slice) {
  return !slice.openStart && !slice.openEnd && $from.start() == $to.start() &&
    $from.parent.canReplace($from.index(), $to.index(), slice.content)
}

function canMoveText($from, $to, slice) {
  if (!$to.parent.isTextblock) { return false }

  var parent = slice.openEnd ? nodeRight(slice.content, slice.openEnd)
      : $from.node($from.depth - (slice.openStart - slice.openEnd));
  if (!parent.isTextblock) { return false }
  for (var i = $to.index(); i < $to.parent.childCount; i++)
    { if (!parent.type.allowsMarks($to.parent.child(i).marks)) { return false } }
  var match;
  if (slice.openEnd) {
    match = parent.contentMatchAt(parent.childCount);
  } else {
    match = parent.contentMatchAt(parent.childCount);
    if (slice.size) { match = match.matchFragment(slice.content, slice.openStart ? 1 : 0); }
  }
  match = match.matchFragment($to.parent.content, $to.index());
  return match && match.validEnd
}

function nodeRight(content, depth) {
  for (var i = 1; i < depth; i++) { content = content.lastChild.content; }
  return content.lastChild
}

// Algorithm for 'placing' the elements of a slice into a gap:
//
// We consider the content of each node that is open to the left to be
// independently placeable. I.e. in <p("foo"), p("bar")>, when the
// paragraph on the left is open, "foo" can be placed (somewhere on
// the left side of the replacement gap) independently from p("bar").
//
// So placeSlice splits up a slice into a number of sub-slices,
// along with information on where they can be placed on the given
// left-side edge. It works by walking the open side of the slice,
// from the inside out, and trying to find a landing spot for each
// element, by simultaneously scanning over the gap side. When no
// place is found for an open node's content, it is left in that node.

// : (ResolvedPos, Slice) → [{content: Fragment, openEnd: number, depth: number}]
function placeSlice($from, slice) {
  var frontier = new Frontier($from);
  for (var pass = 1; slice.size && pass <= 3; pass++)
    { slice = frontier.placeSlice(slice.content, slice.openStart, slice.openEnd, pass); }
  while (frontier.open.length) { frontier.closeNode(); }
  return frontier.placed
}

// Helper class that models the open side of the insert position,
// keeping track of the content match and already inserted content
// at each depth.
var Frontier = function Frontier($pos) {
  var this$1 = this;

  // : [{parent: Node, match: ContentMatch, content: Fragment, wrapper: bool, openEnd: number, depth: number}]
  this.open = [];
  for (var d = 0; d <= $pos.depth; d++) {
    var parent = $pos.node(d), match = parent.contentMatchAt($pos.indexAfter(d));
    this$1.open.push({parent: parent, match: match, content: prosemirrorModel.Fragment.empty, wrapper: false, openEnd: 0, depth: d});
  }
  this.placed = [];
};

// : (Fragment, number, number, number, ?Node) → Slice
// Tries to place the content of the given slice, and returns a
// slice containing unplaced content.
//
// pass 1: try to fit directly
// pass 2: allow wrapper nodes to be introduced
// pass 3: allow unwrapping of nodes that aren't open
Frontier.prototype.placeSlice = function placeSlice (fragment, openStart, openEnd, pass, parent) {
    var this$1 = this;

  if (openStart > 0) {
    var first = fragment.firstChild;
    var inner = this.placeSlice(first.content, Math.max(0, openStart - 1),
                                openEnd && fragment.childCount == 1 ? openEnd - 1 : 0,
                                pass, first);
    if (inner.content != first.content) {
      if (inner.content.size) {
        fragment = fragment.replaceChild(0, first.copy(inner.content));
        openStart = inner.openStart + 1;
      } else {
        if (fragment.childCount == 1) { openEnd = 0; }
        fragment = fragment.cutByIndex(1);
        openStart = 0;
      }
    }
  }
  var result = this.placeContent(fragment, openStart, openEnd, pass, parent);
  if (pass > 2 && result.size && openStart == 0) {
    for (var i = 0; i < result.content.childCount; i++) {
      var child = result.content.child(i);
      this$1.placeContent(child.content, 0,
                        openEnd && i == result.content.childCount.length - 1 ? openEnd - 1 : 0,
                        pass, child);
    }
    result = prosemirrorModel.Fragment.empty;
  }
  return result
};

Frontier.prototype.placeContent = function placeContent (fragment, openStart, openEnd, pass, parent) {
    var this$1 = this;

  var i = 0;
  // Go over the fragment's children
  for (; i < fragment.childCount; i++) {
    var child = fragment.child(i), placed = false, last = i == fragment.childCount - 1;
    // Try each open node in turn, starting from the innermost
    for (var d = this.open.length - 1; d >= 0; d--) {
      var open = this$1.open[d], wrap = (void 0);

      // If pass > 1, it is allowed to wrap the node to help find a
      // fit, so if findWrappeing returns something, we add open
      // nodes to the frontier for that wrapping.
      if (pass > 1 && (wrap = open.match.findWrapping(child.type)) &&
          !(parent && wrap.length && wrap[wrap.length - 1] == parent.type)) {
        while (this.open.length - 1 > d) { this$1.closeNode(); }
        for (var w = 0; w < wrap.length; w++) {
          open.match = open.match.matchType(wrap[w]);
          d++;
          open = {parent: wrap[w].create(),
                  match: wrap[w].contentMatch,
                  content: prosemirrorModel.Fragment.empty, wrapper: true, openEnd: 0, depth: d + w};
          this$1.open.push(open);
        }
      }

      // See if the child fits here
      var match = open.match.matchType(child.type);
      if (!match) {
        var fill = open.match.fillBefore(prosemirrorModel.Fragment.from(child));
        if (fill) {
          for (var j = 0; j < fill.childCount; j++) {
            var ch = fill.child(j);
            this$1.addNode(open, ch, 0);
            match = open.match.matchFragment(ch);
          }
        } else if (parent && open.match.matchType(parent.type)) {
          // Don't continue looking further up if the parent node
          // would fit here.
          break
        } else {
          continue
        }
      }

      // Close open nodes above this one, since we're starting to
      // add to this.
      while (this.open.length - 1 > d) { this$1.closeNode(); }
      // Strip marks from the child or close its start when necessary
      child = child.mark(open.parent.type.allowedMarks(child.marks));
      if (openStart) {
        child = closeNodeStart(child, openStart, last ? openEnd : 0);
        openStart = 0;
      }
      // Add the child to this open node and adjust its metadata
      this$1.addNode(open, child, last ? openEnd : 0);
      open.match = match;
      if (last) { openEnd = 0; }
      placed = true;
      break
    }
    // As soon as we've failed to place a node we stop looking at
    // later nodes
    if (!placed) { break }
  }
  // Close the current open node if it's not the the root and we
  // either placed up to the end of the node or the the current
  // slice depth's node type matches the open node's type
  if (this.open.length > 1 &&
      (i > 0 && i == fragment.childCount ||
       parent && this.open[this.open.length - 1].parent.type == parent.type))
    { this.closeNode(); }

  return new prosemirrorModel.Slice(fragment.cutByIndex(i), openStart, openEnd)
};

Frontier.prototype.addNode = function addNode (open, node, openEnd) {
  open.content = closeFragmentEnd(open.content, open.openEnd).addToEnd(node);
  open.openEnd = openEnd;
};

Frontier.prototype.closeNode = function closeNode () {
  var open = this.open.pop();
  if (open.content.size == 0) {
    // Nothing here
  } else if (open.wrapper) {
    this.addNode(this.open[this.open.length - 1], open.parent.copy(open.content), open.openEnd + 1);
  } else {
    this.placed[open.depth] = {depth: open.depth, content: open.content, openEnd: open.openEnd};
  }
};

function closeNodeStart(node, openStart, openEnd) {
  var content = node.content;
  if (openStart > 1) {
    var first = closeNodeStart(node.firstChild, openStart - 1, node.childCount == 1 ? openEnd - 1 : 0);
    content = node.content.replaceChild(0, first);
  }
  var fill = node.type.contentMatch.fillBefore(content, openEnd == 0);
  return node.copy(fill.append(content))
}

function closeNodeEnd(node, depth) {
  var content = node.content;
  if (depth > 1) {
    var last = closeNodeEnd(node.lastChild, depth - 1);
    content = node.content.replaceChild(node.childCount - 1, last);
  }
  var fill = node.contentMatchAt(node.childCount).fillBefore(prosemirrorModel.Fragment.empty, true);
  return node.copy(content.append(fill))
}

function closeFragmentEnd(fragment, depth) {
  return depth ? fragment.replaceChild(fragment.childCount - 1, closeNodeEnd(fragment.lastChild, depth)) : fragment
}

// :: (number, number, Slice) → this
// Replace a range of the document with a given slice, using `from`,
// `to`, and the slice's [`openStart`](#model.Slice.openStart) property
// as hints, rather than fixed start and end points. This method may
// grow the replaced area or close open nodes in the slice in order to
// get a fit that is more in line with WYSIWYG expectations, by
// dropping fully covered parent nodes of the replaced region when
// they are marked [non-defining](#model.NodeSpec.defining), or
// including an open parent node from the slice that _is_ marked as
// [defining](#model.NodeSpec.defining).
//
// This is the method, for example, to handle paste. The similar
// [`replace`](#transform.Transform.replace) method is a more
// primitive tool which will _not_ move the start and end of its given
// range, and is useful in situations where you need more precise
// control over what happens.
Transform.prototype.replaceRange = function(from, to, slice) {
  var this$1 = this;

  if (!slice.size) { return this.deleteRange(from, to) }

  var $from = this.doc.resolve(from), $to = this.doc.resolve(to);
  if (fitsTrivially($from, $to, slice))
    { return this.step(new ReplaceStep(from, to, slice)) }

  var targetDepths = coveredDepths($from, this.doc.resolve(to));
  // Can't replace the whole document, so remove 0 if it's present
  if (targetDepths[targetDepths.length - 1] == 0) { targetDepths.pop(); }
  // Negative numbers represent not expansion over the whole node at
  // that depth, but replacing from $from.before(-D) to $to.pos.
  var preferredTarget = -($from.depth + 1);
  targetDepths.unshift(preferredTarget);
  // This loop picks a preferred target depth, if one of the covering
  // depths is not outside of a defining node, and adds negative
  // depths for any depth that has $from at its start and does not
  // cross a defining node.
  for (var d = $from.depth, pos = $from.pos - 1; d > 0; d--, pos--) {
    var spec = $from.node(d).type.spec;
    if (spec.defining || spec.isolating) { break }
    if (targetDepths.indexOf(d) > -1) { preferredTarget = d; }
    else if ($from.before(d) == pos) { targetDepths.splice(1, 0, -d); }
  }
  // Try to fit each possible depth of the slice into each possible
  // target depth, starting with the preferred depths.
  var preferredTargetIndex = targetDepths.indexOf(preferredTarget);

  var leftNodes = [], preferredDepth = slice.openStart;
  for (var content = slice.content, i = 0;; i++) {
    var node = content.firstChild;
    leftNodes.push(node);
    if (i == slice.openStart) { break }
    content = node.content;
  }
  // Back up if the node directly above openStart, or the node above
  // that separated only by a non-defining textblock node, is defining.
  if (preferredDepth > 0 && leftNodes[preferredDepth - 1].type.spec.defining &&
      $from.node(preferredTargetIndex).type != leftNodes[preferredDepth - 1].type)
    { preferredDepth -= 1; }
  else if (preferredDepth >= 2 && leftNodes[preferredDepth - 1].isTextblock && leftNodes[preferredDepth - 2].type.spec.defining &&
           $from.node(preferredTargetIndex).type != leftNodes[preferredDepth - 2].type)
    { preferredDepth -= 2; }

  for (var j = slice.openStart; j >= 0; j--) {
    var openDepth = (j + preferredDepth + 1) % (slice.openStart + 1);
    var insert = leftNodes[openDepth];
    if (!insert) { continue }
    for (var i$1 = 0; i$1 < targetDepths.length; i$1++) {
      // Loop over possible expansion levels, starting with the
      // preferred one
      var targetDepth = targetDepths[(i$1 + preferredTargetIndex) % targetDepths.length], expand = true;
      if (targetDepth < 0) { expand = false; targetDepth = -targetDepth; }
      var parent = $from.node(targetDepth - 1), index = $from.index(targetDepth - 1);
      if (parent.canReplaceWith(index, index, insert.type, insert.marks))
        { return this$1.replace($from.before(targetDepth), expand ? $to.after(targetDepth) : to,
                            new prosemirrorModel.Slice(closeFragment(slice.content, 0, slice.openStart, openDepth),
                                      openDepth, slice.openEnd)) }
    }
  }

  return this.replace(from, to, slice)
};

function closeFragment(fragment, depth, oldOpen, newOpen, parent) {
  if (depth < oldOpen) {
    var first = fragment.firstChild;
    fragment = fragment.replaceChild(0, first.copy(closeFragment(first.content, depth + 1, oldOpen, newOpen, first)));
  }
  if (depth > newOpen)
    { fragment = parent.contentMatchAt(0).fillBefore(fragment, true).append(fragment); }
  return fragment
}

// :: (number, number, Node) → this
// Replace the given range with a node, but use `from` and `to` as
// hints, rather than precise positions. When from and to are the same
// and are at the start or end of a parent node in which the given
// node doesn't fit, this method may _move_ them out towards a parent
// that does allow the given node to be placed. When the given range
// completely covers a parent node, this method may completely replace
// that parent node.
Transform.prototype.replaceRangeWith = function(from, to, node) {
  if (!node.isInline && from == to && this.doc.resolve(from).parent.content.size) {
    var point = insertPoint(this.doc, from, node.type);
    if (point != null) { from = to = point; }
  }
  return this.replaceRange(from, to, new prosemirrorModel.Slice(prosemirrorModel.Fragment.from(node), 0, 0))
};

// :: (number, number) → this
// Delete the given range, expanding it to cover fully covered
// parent nodes until a valid replace is found.
Transform.prototype.deleteRange = function(from, to) {
  var this$1 = this;

  var $from = this.doc.resolve(from), $to = this.doc.resolve(to);
  var covered = coveredDepths($from, $to);
  for (var i = 0; i < covered.length; i++) {
    var depth = covered[i], last = i == covered.length - 1;
    if ((last && depth == 0) || $from.node(depth).type.contentMatch.validEnd)
      { return this$1.delete($from.start(depth), $to.end(depth)) }
    if (depth > 0 && (last || $from.node(depth - 1).canReplace($from.index(depth - 1), $to.indexAfter(depth - 1))))
      { return this$1.delete($from.before(depth), $to.after(depth)) }
  }
  for (var d = 1; d <= $from.depth; d++) {
    if (from - $from.start(d) == $from.depth - d && to > $from.end(d))
      { return this$1.delete($from.before(d), to) }
  }
  return this.delete(from, to)
};

// : (ResolvedPos, ResolvedPos) → [number]
// Returns an array of all depths for which $from - $to spans the
// whole content of the nodes at that depth.
function coveredDepths($from, $to) {
  var result = [], minDepth = Math.min($from.depth, $to.depth);
  for (var d = minDepth; d >= 0; d--) {
    var start = $from.start(d);
    if (start < $from.pos - ($from.depth - d) ||
        $to.end(d) > $to.pos + ($to.depth - d) ||
        $from.node(d).type.spec.isolating ||
        $to.node(d).type.spec.isolating) { break }
    if (start == $to.start(d)) { result.push(d); }
  }
  return result
}

exports.Transform = Transform;
exports.TransformError = TransformError;
exports.Step = Step;
exports.StepResult = StepResult;
exports.joinPoint = joinPoint;
exports.canJoin = canJoin;
exports.canSplit = canSplit;
exports.insertPoint = insertPoint;
exports.dropPoint = dropPoint;
exports.liftTarget = liftTarget;
exports.findWrapping = findWrapping;
exports.StepMap = StepMap;
exports.MapResult = MapResult;
exports.Mapping = Mapping;
exports.AddMarkStep = AddMarkStep;
exports.RemoveMarkStep = RemoveMarkStep;
exports.ReplaceStep = ReplaceStep;
exports.ReplaceAroundStep = ReplaceAroundStep;
exports.replaceStep = replaceStep;
//# sourceMappingURL=index.js.map

},{"prosemirror-model":"../node_modules/prosemirror-model/dist/index.js"}],"../node_modules/prosemirror-state/dist/index.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var prosemirrorModel = require('prosemirror-model');
var prosemirrorTransform = require('prosemirror-transform');

var classesById = Object.create(null);

// ::- Superclass for editor selections. Every selection type should
// extend this. Should not be instantiated directly.
var Selection = function Selection($anchor, $head, ranges) {
  // :: [SelectionRange]
  // The ranges covered by the selection.
  this.ranges = ranges || [new SelectionRange($anchor.min($head), $anchor.max($head))];
  // :: ResolvedPos
  // The resolved anchor of the selection (the side that stays in
  // place when the selection is modified).
  this.$anchor = $anchor;
  // :: ResolvedPos
  // The resolved head of the selection (the side that moves when
  // the selection is modified).
  this.$head = $head;
};

var prototypeAccessors = { anchor: {},head: {},from: {},to: {},$from: {},$to: {},empty: {} };

// :: number
// The selection's anchor, as an unresolved position.
prototypeAccessors.anchor.get = function () { return this.$anchor.pos };

// :: number
// The selection's head.
prototypeAccessors.head.get = function () { return this.$head.pos };

// :: number
// The lower bound of the selection's main range.
prototypeAccessors.from.get = function () { return this.$from.pos };

// :: number
// The upper bound of the selection's main range.
prototypeAccessors.to.get = function () { return this.$to.pos };

// :: ResolvedPos
// The resolved lowerbound of the selection's main range.
prototypeAccessors.$from.get = function () {
  return this.ranges[0].$from
};

// :: ResolvedPos
// The resolved upper bound of the selection's main range.
prototypeAccessors.$to.get = function () {
  return this.ranges[0].$to
};

// :: bool
// Indicates whether the selection contains any content.
prototypeAccessors.empty.get = function () {
  var ranges = this.ranges;
  for (var i = 0; i < ranges.length; i++)
    { if (ranges[i].$from.pos != ranges[i].$to.pos) { return false } }
  return true
};

// eq:: (Selection) → bool
// Test whether the selection is the same as another selection.

// map:: (doc: Node, mapping: Mappable) → Selection
// Map this selection through a [mappable](#transform.Mappable) thing. `doc`
// should be the new document to which we are mapping.

// :: () → Slice
// Get the content of this selection as a slice.
Selection.prototype.content = function content () {
  return this.$from.node(0).slice(this.from, this.to, true)
};

// :: (Transaction, ?Slice)
// Replace the selection with a slice or, if no slice is given,
// delete the selection. Will append to the given transaction.
Selection.prototype.replace = function replace (tr, content) {
    if ( content === void 0 ) content = prosemirrorModel.Slice.empty;

  // Put the new selection at the position after the inserted
  // content. When that ended in an inline node, search backwards,
  // to get the position after that node. If not, search forward.
  var lastNode = content.content.lastChild, lastParent = null;
  for (var i = 0; i < content.openEnd; i++) {
    lastParent = lastNode;
    lastNode = lastNode.lastChild;
  }

  var mapFrom = tr.steps.length, ranges = this.ranges;
  for (var i$1 = 0; i$1 < ranges.length; i$1++) {
    var ref = ranges[i$1];
      var $from = ref.$from;
      var $to = ref.$to;
      var mapping = tr.mapping.slice(mapFrom);
    tr.replaceRange(mapping.map($from.pos), mapping.map($to.pos), i$1 ? prosemirrorModel.Slice.empty : content);
    if (i$1 == 0)
      { selectionToInsertionEnd(tr, mapFrom, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1); }
  }
};

// :: (Transaction, Node)
// Replace the selection with the given node, appending the changes
// to the given transaction.
Selection.prototype.replaceWith = function replaceWith (tr, node) {
  var mapFrom = tr.steps.length, ranges = this.ranges;
  for (var i = 0; i < ranges.length; i++) {
    var ref = ranges[i];
      var $from = ref.$from;
      var $to = ref.$to;
      var mapping = tr.mapping.slice(mapFrom);
    var from = mapping.map($from.pos), to = mapping.map($to.pos);
    if (i) {
      tr.deleteRange(from, to);
    } else {
      tr.replaceRangeWith(from, to, node);
      selectionToInsertionEnd(tr, mapFrom, node.isInline ? -1 : 1);
    }
  }
};

// toJSON:: () → Object
// Convert the selection to a JSON representation. When implementing
// this for a custom selection class, make sure to give the object a
// `type` property whose value matches the ID under which you
// [registered](#state.Selection^jsonID) your class.

// :: (ResolvedPos, number, ?bool) → ?Selection
// Find a valid cursor or leaf node selection starting at the given
// position and searching back if `dir` is negative, and forward if
// positive. When `textOnly` is true, only consider cursor
// selections. Will return null when no valid selection position is
// found.
Selection.findFrom = function findFrom ($pos, dir, textOnly) {
  var inner = $pos.parent.inlineContent ? new TextSelection($pos)
      : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly);
  if (inner) { return inner }

  for (var depth = $pos.depth - 1; depth >= 0; depth--) {
    var found = dir < 0
        ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly)
        : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly);
    if (found) { return found }
  }
};

// :: (ResolvedPos, ?number) → Selection
// Find a valid cursor or leaf node selection near the given
// position. Searches forward first by default, but if `bias` is
// negative, it will search backwards first.
Selection.near = function near ($pos, bias) {
    if ( bias === void 0 ) bias = 1;

  return this.findFrom($pos, bias) || this.findFrom($pos, -bias) || new AllSelection($pos.node(0))
};

// :: (Node) → Selection
// Find the cursor or leaf node selection closest to the start of
// the given document. Will return an
// [`AllSelection`](#state.AllSelection) if no valid position
// exists.
Selection.atStart = function atStart (doc) {
  return findSelectionIn(doc, doc, 0, 0, 1) || new AllSelection(doc)
};

// :: (Node) → Selection
// Find the cursor or leaf node selection closest to the end of the
// given document.
Selection.atEnd = function atEnd (doc) {
  return findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1) || new AllSelection(doc)
};

// :: (Node, Object) → Selection
// Deserialize the JSON representation of a selection. Must be
// implemented for custom classes (as a static class method).
Selection.fromJSON = function fromJSON (doc, json) {
  if (!json || !json.type) { throw new RangeError("Invalid input for Selection.fromJSON") }
  var cls = classesById[json.type];
  if (!cls) { throw new RangeError(("No selection type " + (json.type) + " defined")) }
  return cls.fromJSON(doc, json)
};

// :: (string, constructor<Selection>)
// To be able to deserialize selections from JSON, custom selection
// classes must register themselves with an ID string, so that they
// can be disambiguated. Try to pick something that's unlikely to
// clash with classes from other modules.
Selection.jsonID = function jsonID (id, selectionClass) {
  if (id in classesById) { throw new RangeError("Duplicate use of selection JSON ID " + id) }
  classesById[id] = selectionClass;
  selectionClass.prototype.jsonID = id;
  return selectionClass
};

// :: () → SelectionBookmark
// Get a [bookmark](#state.SelectionBookmark) for this selection,
// which is a value that can be mapped without having access to a
// current document, and later resolved to a real selection for a
// given document again. (This is used mostly by the history to
// track and restore old selections.) The default implementation of
// this method just converts the selection to a text selection and
// returns the bookmark for that.
Selection.prototype.getBookmark = function getBookmark () {
  return TextSelection.between(this.$anchor, this.$head).getBookmark()
};

Object.defineProperties( Selection.prototype, prototypeAccessors );

// :: bool
// Controls whether, when a selection of this type is active in the
// browser, the selected range should be visible to the user. Defaults
// to `true`.
Selection.prototype.visible = true;

// SelectionBookmark:: interface
// A lightweight, document-independent representation of a selection.
// You can define a custom bookmark type for a custom selection class
// to make the history handle it well.
//
//   map:: (mapping: Mapping) → SelectionBookmark
//   Map the bookmark through a set of changes.
//
//   resolve:: (doc: Node) → Selection
//   Resolve the bookmark to a real selection again. This may need to
//   do some error checking and may fall back to a default (usually
//   [`TextSelection.between`](#state.TextSelection^between)) if
//   mapping made the bookmark invalid.

// ::- Represents a selected range in a document.
var SelectionRange = function SelectionRange($from, $to) {
  // :: ResolvedPos
  // The lower bound of the range.
  this.$from = $from;
  // :: ResolvedPos
  // The upper bound of the range.
  this.$to = $to;
};

// ::- A text selection represents a classical editor selection, with
// a head (the moving side) and anchor (immobile side), both of which
// point into textblock nodes. It can be empty (a regular cursor
// position).
var TextSelection = (function (Selection) {
  function TextSelection($anchor, $head) {
    if ( $head === void 0 ) $head = $anchor;

    Selection.call(this, $anchor, $head);
  }

  if ( Selection ) TextSelection.__proto__ = Selection;
  TextSelection.prototype = Object.create( Selection && Selection.prototype );
  TextSelection.prototype.constructor = TextSelection;

  var prototypeAccessors$1 = { $cursor: {} };

  // :: ?ResolvedPos
  // Returns a resolved position if this is a cursor selection (an
  // empty text selection), and null otherwise.
  prototypeAccessors$1.$cursor.get = function () { return this.$anchor.pos == this.$head.pos ? this.$head : null };

  TextSelection.prototype.map = function map (doc, mapping) {
    var $head = doc.resolve(mapping.map(this.head));
    if (!$head.parent.inlineContent) { return Selection.near($head) }
    var $anchor = doc.resolve(mapping.map(this.anchor));
    return new TextSelection($anchor.parent.inlineContent ? $anchor : $head, $head)
  };

  TextSelection.prototype.replace = function replace (tr, content) {
    if ( content === void 0 ) content = prosemirrorModel.Slice.empty;

    Selection.prototype.replace.call(this, tr, content);
    if (content == prosemirrorModel.Slice.empty) {
      var marks = this.$from.marksAcross(this.$to);
      if (marks) { tr.ensureMarks(marks); }
    }
  };

  TextSelection.prototype.eq = function eq (other) {
    return other instanceof TextSelection && other.anchor == this.anchor && other.head == this.head
  };

  TextSelection.prototype.getBookmark = function getBookmark () {
    return new TextBookmark(this.anchor, this.head)
  };

  TextSelection.prototype.toJSON = function toJSON () {
    return {type: "text", anchor: this.anchor, head: this.head}
  };

  TextSelection.fromJSON = function fromJSON (doc, json) {
    if (typeof json.anchor != "number" || typeof json.head != "number")
      { throw new RangeError("Invalid input for TextSelection.fromJSON") }
    return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head))
  };

  // :: (Node, number, ?number) → TextSelection
  // Create a text selection from non-resolved positions.
  TextSelection.create = function create (doc, anchor, head) {
    if ( head === void 0 ) head = anchor;

    var $anchor = doc.resolve(anchor);
    return new this($anchor, head == anchor ? $anchor : doc.resolve(head))
  };

  // :: (ResolvedPos, ResolvedPos, ?number) → Selection
  // Return a text selection that spans the given positions or, if
  // they aren't text positions, find a text selection near them.
  // `bias` determines whether the method searches forward (default)
  // or backwards (negative number) first. Will fall back to calling
  // [`Selection.near`](#state.Selection^near) when the document
  // doesn't contain a valid text position.
  TextSelection.between = function between ($anchor, $head, bias) {
    var dPos = $anchor.pos - $head.pos;
    if (!bias || dPos) { bias = dPos >= 0 ? 1 : -1; }
    if (!$head.parent.inlineContent) {
      var found = Selection.findFrom($head, bias, true) || Selection.findFrom($head, -bias, true);
      if (found) { $head = found.$head; }
      else { return Selection.near($head, bias) }
    }
    if (!$anchor.parent.inlineContent) {
      if (dPos == 0) {
        $anchor = $head;
      } else {
        $anchor = (Selection.findFrom($anchor, -bias, true) || Selection.findFrom($anchor, bias, true)).$anchor;
        if (($anchor.pos < $head.pos) != (dPos < 0)) { $anchor = $head; }
      }
    }
    return new TextSelection($anchor, $head)
  };

  Object.defineProperties( TextSelection.prototype, prototypeAccessors$1 );

  return TextSelection;
}(Selection));

Selection.jsonID("text", TextSelection);

var TextBookmark = function TextBookmark(anchor, head) {
  this.anchor = anchor;
  this.head = head;
};
TextBookmark.prototype.map = function map (mapping) {
  return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head))
};
TextBookmark.prototype.resolve = function resolve (doc) {
  return TextSelection.between(doc.resolve(this.anchor), doc.resolve(this.head))
};

// ::- A node selection is a selection that points at a single node.
// All nodes marked [selectable](#model.NodeSpec.selectable) can be
// the target of a node selection. In such a selection, `from` and
// `to` point directly before and after the selected node, `anchor`
// equals `from`, and `head` equals `to`..
var NodeSelection = (function (Selection) {
  function NodeSelection($pos) {
    var node = $pos.nodeAfter;
    var $end = $pos.node(0).resolve($pos.pos + node.nodeSize);
    Selection.call(this, $pos, $end);
    // :: Node The selected node.
    this.node = node;
  }

  if ( Selection ) NodeSelection.__proto__ = Selection;
  NodeSelection.prototype = Object.create( Selection && Selection.prototype );
  NodeSelection.prototype.constructor = NodeSelection;

  NodeSelection.prototype.map = function map (doc, mapping) {
    var ref = mapping.mapResult(this.anchor);
    var deleted = ref.deleted;
    var pos = ref.pos;
    var $pos = doc.resolve(pos);
    if (deleted) { return Selection.near($pos) }
    return new NodeSelection($pos)
  };

  NodeSelection.prototype.content = function content () {
    return new prosemirrorModel.Slice(prosemirrorModel.Fragment.from(this.node), 0, 0)
  };

  NodeSelection.prototype.eq = function eq (other) {
    return other instanceof NodeSelection && other.anchor == this.anchor
  };

  NodeSelection.prototype.toJSON = function toJSON () {
    return {type: "node", anchor: this.anchor}
  };

  NodeSelection.prototype.getBookmark = function getBookmark () { return new NodeBookmark(this.anchor) };

  NodeSelection.fromJSON = function fromJSON (doc, json) {
    if (typeof json.anchor != "number")
      { throw new RangeError("Invalid input for NodeSelection.fromJSON") }
    return new NodeSelection(doc.resolve(json.anchor))
  };

  // :: (Node, number) → NodeSelection
  // Create a node selection from non-resolved positions.
  NodeSelection.create = function create (doc, from) {
    return new this(doc.resolve(from))
  };

  // :: (Node) → bool
  // Determines whether the given node may be selected as a node
  // selection.
  NodeSelection.isSelectable = function isSelectable (node) {
    return !node.isText && node.type.spec.selectable !== false
  };

  return NodeSelection;
}(Selection));

NodeSelection.prototype.visible = false;

Selection.jsonID("node", NodeSelection);

var NodeBookmark = function NodeBookmark(anchor) {
  this.anchor = anchor;
};
NodeBookmark.prototype.map = function map (mapping) {
  var ref = mapping.mapResult(this.anchor);
    var deleted = ref.deleted;
    var pos = ref.pos;
  return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos)
};
NodeBookmark.prototype.resolve = function resolve (doc) {
  var $pos = doc.resolve(this.anchor), node = $pos.nodeAfter;
  if (node && NodeSelection.isSelectable(node)) { return new NodeSelection($pos) }
  return Selection.near($pos)
};

// ::- A selection type that represents selecting the whole document
// (which can not necessarily be expressed with a text selection, when
// there are for example leaf block nodes at the start or end of the
// document).
var AllSelection = (function (Selection) {
  function AllSelection(doc) {
    Selection.call(this, doc.resolve(0), doc.resolve(doc.content.size));
  }

  if ( Selection ) AllSelection.__proto__ = Selection;
  AllSelection.prototype = Object.create( Selection && Selection.prototype );
  AllSelection.prototype.constructor = AllSelection;

  AllSelection.prototype.toJSON = function toJSON () { return {type: "all"} };

  AllSelection.fromJSON = function fromJSON (doc) { return new AllSelection(doc) };

  AllSelection.prototype.map = function map (doc) { return new AllSelection(doc) };

  AllSelection.prototype.eq = function eq (other) { return other instanceof AllSelection };

  AllSelection.prototype.getBookmark = function getBookmark () { return AllBookmark };

  return AllSelection;
}(Selection));

Selection.jsonID("all", AllSelection);

var AllBookmark = {
  map: function map() { return this },
  resolve: function resolve(doc) { return new AllSelection(doc) }
};

// FIXME we'll need some awareness of text direction when scanning for selections

// Try to find a selection inside the given node. `pos` points at the
// position where the search starts. When `text` is true, only return
// text selections.
function findSelectionIn(doc, node, pos, index, dir, text) {
  if (node.inlineContent) { return TextSelection.create(doc, pos) }
  for (var i = index - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
    var child = node.child(i);
    if (!child.isAtom) {
      var inner = findSelectionIn(doc, child, pos + dir, dir < 0 ? child.childCount : 0, dir, text);
      if (inner) { return inner }
    } else if (!text && NodeSelection.isSelectable(child)) {
      return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0))
    }
    pos += child.nodeSize * dir;
  }
}

function selectionToInsertionEnd(tr, startLen, bias) {
  var last = tr.steps.length - 1;
  if (last < startLen) { return }
  var step = tr.steps[last];
  if (!(step instanceof prosemirrorTransform.ReplaceStep || step instanceof prosemirrorTransform.ReplaceAroundStep)) { return }
  var map = tr.mapping.maps[last], end;
  map.forEach(function (_from, _to, _newFrom, newTo) { if (end == null) { end = newTo; } });
  tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
}

var UPDATED_SEL = 1;
var UPDATED_MARKS = 2;
var UPDATED_SCROLL = 4;

// ::- An editor state transaction, which can be applied to a state to
// create an updated state. Use
// [`EditorState.tr`](#state.EditorState.tr) to create an instance.
//
// Transactions track changes to the document (they are a subclass of
// [`Transform`](#transform.Transform)), but also other state changes,
// like selection updates and adjustments of the set of [stored
// marks](#state.EditorState.storedMarks). In addition, you can store
// metadata properties in a transaction, which are extra pieces of
// information that client code or plugins can use to describe what a
// transacion represents, so that they can update their [own
// state](#state.StateField) accordingly.
//
// The [editor view](#view.EditorView) uses a few metadata properties:
// it will attach a property `"pointer"` with the value `true` to
// selection transactions directly caused by mouse or touch input, and
// a `"uiEvent"` property of that may be `"paste"`, `"cut"`, or `"drop"`.
var Transaction = (function (Transform$$1) {
  function Transaction(state) {
    Transform$$1.call(this, state.doc);
    // :: number
    // The timestamp associated with this transaction, in the same
    // format as `Date.now()`.
    this.time = Date.now();
    this.curSelection = state.selection;
    // The step count for which the current selection is valid.
    this.curSelectionFor = 0;
    // :: ?[Mark]
    // The stored marks set by this transaction, if any.
    this.storedMarks = state.storedMarks;
    // Bitfield to track which aspects of the state were updated by
    // this transaction.
    this.updated = 0;
    // Object used to store metadata properties for the transaction.
    this.meta = Object.create(null);
  }

  if ( Transform$$1 ) Transaction.__proto__ = Transform$$1;
  Transaction.prototype = Object.create( Transform$$1 && Transform$$1.prototype );
  Transaction.prototype.constructor = Transaction;

  var prototypeAccessors = { selection: {},selectionSet: {},storedMarksSet: {},isGeneric: {},scrolledIntoView: {} };

  // :: Selection
  // The transaction's current selection. This defaults to the editor
  // selection [mapped](#state.Selection.map) through the steps in the
  // transaction, but can be overwritten with
  // [`setSelection`](#state.Transaction.setSelection).
  prototypeAccessors.selection.get = function () {
    if (this.curSelectionFor < this.steps.length) {
      this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor));
      this.curSelectionFor = this.steps.length;
    }
    return this.curSelection
  };

  // :: (Selection) → Transaction
  // Update the transaction's current selection. Will determine the
  // selection that the editor gets when the transaction is applied.
  Transaction.prototype.setSelection = function setSelection (selection) {
    this.curSelection = selection;
    this.curSelectionFor = this.steps.length;
    this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS;
    this.storedMarks = null;
    return this
  };

  // :: bool
  // Whether the selection was explicitly updated by this transaction.
  prototypeAccessors.selectionSet.get = function () {
    return (this.updated & UPDATED_SEL) > 0
  };

  // :: (?[Mark]) → Transaction
  // Set the current stored marks.
  Transaction.prototype.setStoredMarks = function setStoredMarks (marks) {
    this.storedMarks = marks;
    this.updated |= UPDATED_MARKS;
    return this
  };

  // :: ([Mark]) → Transaction
  // Make sure the current stored marks or, if that is null, the marks
  // at the selection, match the given set of marks. Does nothing if
  // this is already the case.
  Transaction.prototype.ensureMarks = function ensureMarks (marks) {
    if (!prosemirrorModel.Mark.sameSet(this.storedMarks || this.selection.$from.marks(), marks))
      { this.setStoredMarks(marks); }
    return this
  };

  // :: (Mark) → Transaction
  // Add a mark to the set of stored marks.
  Transaction.prototype.addStoredMark = function addStoredMark (mark) {
    return this.ensureMarks(mark.addToSet(this.storedMarks || this.selection.$head.marks()))
  };

  // :: (union<Mark, MarkType>) → Transaction
  // Remove a mark or mark type from the set of stored marks.
  Transaction.prototype.removeStoredMark = function removeStoredMark (mark) {
    return this.ensureMarks(mark.removeFromSet(this.storedMarks || this.selection.$head.marks()))
  };

  // :: bool
  // Whether the stored marks were explicitly set for this transaction.
  prototypeAccessors.storedMarksSet.get = function () {
    return (this.updated & UPDATED_MARKS) > 0
  };

  Transaction.prototype.addStep = function addStep (step, doc) {
    Transform$$1.prototype.addStep.call(this, step, doc);
    this.updated = this.updated & ~UPDATED_MARKS;
    this.storedMarks = null;
  };

  // :: (number) → Transaction
  // Update the timestamp for the transaction.
  Transaction.prototype.setTime = function setTime (time) {
    this.time = time;
    return this
  };

  // :: (Slice) → Transaction
  // Replace the current selection with the given slice.
  Transaction.prototype.replaceSelection = function replaceSelection (slice) {
    this.selection.replace(this, slice);
    return this
  };

  // :: (Node, ?bool) → Transaction
  // Replace the selection with the given node. When `inheritMarks` is
  // true and the content is inline, it inherits the marks from the
  // place where it is inserted.
  Transaction.prototype.replaceSelectionWith = function replaceSelectionWith (node, inheritMarks) {
    var selection = this.selection;
    if (inheritMarks !== false)
      { node = node.mark(this.storedMarks || (selection.empty ? selection.$from.marks() : (selection.$from.marksAcross(selection.$to) || prosemirrorModel.Mark.none))); }
    selection.replaceWith(this, node);
    return this
  };

  // :: () → Transaction
  // Delete the selection.
  Transaction.prototype.deleteSelection = function deleteSelection () {
    this.selection.replace(this);
    return this
  };

  // :: (string, from: ?number, to: ?number) → Transaction
  // Replace the given range, or the selection if no range is given,
  // with a text node containing the given string.
  Transaction.prototype.insertText = function insertText (text, from, to) {
    if ( to === void 0 ) to = from;

    var schema = this.doc.type.schema;
    if (from == null) {
      if (!text) { return this.deleteSelection() }
      return this.replaceSelectionWith(schema.text(text), true)
    } else {
      if (!text) { return this.deleteRange(from, to) }
      var marks = this.storedMarks;
      if (!marks) {
        var $from = this.doc.resolve(from);
        marks = to == from ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
      }
      this.replaceRangeWith(from, to, schema.text(text, marks));
      if (!this.selection.empty) { this.setSelection(Selection.near(this.selection.$to)); }
      return this
    }
  };

  // :: (union<string, Plugin, PluginKey>, any) → Transaction
  // Store a metadata property in this transaction, keyed either by
  // name or by plugin.
  Transaction.prototype.setMeta = function setMeta (key, value) {
    this.meta[typeof key == "string" ? key : key.key] = value;
    return this
  };

  // :: (union<string, Plugin, PluginKey>) → any
  // Retrieve a metadata property for a given name or plugin.
  Transaction.prototype.getMeta = function getMeta (key) {
    return this.meta[typeof key == "string" ? key : key.key]
  };

  // :: bool
  // Returns true if this transaction doesn't contain any metadata,
  // and can thus safely be extended.
  prototypeAccessors.isGeneric.get = function () {
    var this$1 = this;

    for (var _ in this$1.meta) { return false }
    return true
  };

  // :: () → Transaction
  // Indicate that the editor should scroll the selection into view
  // when updated to the state produced by this transaction.
  Transaction.prototype.scrollIntoView = function scrollIntoView () {
    this.updated |= UPDATED_SCROLL;
    return this
  };

  prototypeAccessors.scrolledIntoView.get = function () {
    return (this.updated & UPDATED_SCROLL) > 0
  };

  Object.defineProperties( Transaction.prototype, prototypeAccessors );

  return Transaction;
}(prosemirrorTransform.Transform));

function bind(f, self) {
  return !self || !f ? f : f.bind(self)
}

var FieldDesc = function FieldDesc(name, desc, self) {
  this.name = name;
  this.init = bind(desc.init, self);
  this.apply = bind(desc.apply, self);
};

var baseFields = [
  new FieldDesc("doc", {
    init: function init(config) { return config.doc || config.schema.topNodeType.createAndFill() },
    apply: function apply(tr) { return tr.doc }
  }),

  new FieldDesc("selection", {
    init: function init(config, instance) { return config.selection || Selection.atStart(instance.doc) },
    apply: function apply(tr) { return tr.selection }
  }),

  new FieldDesc("storedMarks", {
    init: function init(config) { return config.storedMarks || null },
    apply: function apply(tr, _marks, _old, state) { return state.selection.$cursor ? tr.storedMarks : null }
  }),

  new FieldDesc("scrollToSelection", {
    init: function init() { return 0 },
    apply: function apply(tr, prev) { return tr.scrolledIntoView ? prev + 1 : prev }
  })
];

// Object wrapping the part of a state object that stays the same
// across transactions. Stored in the state's `config` property.
var Configuration = function Configuration(schema, plugins) {
  var this$1 = this;

  this.schema = schema;
  this.fields = baseFields.concat();
  this.plugins = [];
  this.pluginsByKey = Object.create(null);
  if (plugins) { plugins.forEach(function (plugin) {
    if (this$1.pluginsByKey[plugin.key])
      { throw new RangeError("Adding different instances of a keyed plugin (" + plugin.key + ")") }
    this$1.plugins.push(plugin);
    this$1.pluginsByKey[plugin.key] = plugin;
    if (plugin.spec.state)
      { this$1.fields.push(new FieldDesc(plugin.key, plugin.spec.state, plugin)); }
  }); }
};

// ::- The state of a ProseMirror editor is represented by an object
// of this type. A state is a persistent data structure—it isn't
// updated, but rather a new state value is computed from an old one
// using the [`apply`](#state.EditorState.apply) method.
//
// A state holds a number of built-in fields, and plugins can
// [define](#state.PluginSpec.state) additional fields.
var EditorState = function EditorState(config) {
  this.config = config;
};

var prototypeAccessors$1 = { schema: {},plugins: {},tr: {} };

// doc:: Node
// The current document.

// selection:: Selection
// The selection.

// storedMarks:: ?[Mark]
// A set of marks to apply to the next input. Will be null when
// no explicit marks have been set.

// :: Schema
// The schema of the state's document.
prototypeAccessors$1.schema.get = function () {
  return this.config.schema
};

// :: [Plugin]
// The plugins that are active in this state.
prototypeAccessors$1.plugins.get = function () {
  return this.config.plugins
};

// :: (Transaction) → EditorState
// Apply the given transaction to produce a new state.
EditorState.prototype.apply = function apply (tr) {
  return this.applyTransaction(tr).state
};

// : (Transaction) → bool
EditorState.prototype.filterTransaction = function filterTransaction (tr, ignore) {
    var this$1 = this;
    if ( ignore === void 0 ) ignore = -1;

  for (var i = 0; i < this.config.plugins.length; i++) { if (i != ignore) {
    var plugin = this$1.config.plugins[i];
    if (plugin.spec.filterTransaction && !plugin.spec.filterTransaction.call(plugin, tr, this$1))
      { return false }
  } }
  return true
};

// :: (Transaction) → {state: EditorState, transactions: [Transaction]}
// Verbose variant of [`apply`](#state.EditorState.apply) that
// returns the precise transactions that were applied (which might
// be influenced by the [transaction
// hooks](#state.PluginSpec.filterTransaction) of
// plugins) along with the new state.
EditorState.prototype.applyTransaction = function applyTransaction (rootTr) {
    var this$1 = this;

  if (!this.filterTransaction(rootTr)) { return {state: this, transactions: []} }

  var trs = [rootTr], newState = this.applyInner(rootTr), seen = null;
  // This loop repeatedly gives plugins a chance to respond to
  // transactions as new transactions are added, making sure to only
  // pass the transactions the plugin did not see before.
  outer: for (;;) {
    var haveNew = false;
    for (var i = 0; i < this.config.plugins.length; i++) {
      var plugin = this$1.config.plugins[i];
      if (plugin.spec.appendTransaction) {
        var n = seen ? seen[i].n : 0, oldState = seen ? seen[i].state : this$1;
        var tr = n < trs.length &&
            plugin.spec.appendTransaction.call(plugin, n ? trs.slice(n) : trs, oldState, newState);
        if (tr && newState.filterTransaction(tr, i)) {
          tr.setMeta("appendedTransaction", rootTr);
          if (!seen) {
            seen = [];
            for (var j = 0; j < this.config.plugins.length; j++)
              { seen.push(j < i ? {state: newState, n: trs.length} : {state: this$1, n: 0}); }
          }
          trs.push(tr);
          newState = newState.applyInner(tr);
          haveNew = true;
        }
        if (seen) { seen[i] = {state: newState, n: trs.length}; }
      }
    }
    if (!haveNew) { return {state: newState, transactions: trs} }
  }
};

// : (Transaction) → EditorState
EditorState.prototype.applyInner = function applyInner (tr) {
    var this$1 = this;

  if (!tr.before.eq(this.doc)) { throw new RangeError("Applying a mismatched transaction") }
  var newInstance = new EditorState(this.config), fields = this.config.fields;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    newInstance[field.name] = field.apply(tr, this$1[field.name], this$1, newInstance);
  }
  for (var i$1 = 0; i$1 < applyListeners.length; i$1++) { applyListeners[i$1](this$1, tr, newInstance); }
  return newInstance
};

// :: Transaction
// Start a [transaction](#state.Transaction) from this state.
prototypeAccessors$1.tr.get = function () { return new Transaction(this) };

// :: (Object) → EditorState
// Create a new state.
//
// config::- Configuration options. Must contain `schema` or `doc` (or both).
//
//    schema:: ?Schema
//    The schema to use.
//
//    doc:: ?Node
//    The starting document.
//
//    selection:: ?Selection
//    A valid selection in the document.
//
//    storedMarks:: ?[Mark]
//    The initial set of [stored marks](#state.EditorState.storedMarks).
//
//    plugins:: ?[Plugin]
//    The plugins that should be active in this state.
EditorState.create = function create (config) {
  var $config = new Configuration(config.schema || config.doc.type.schema, config.plugins);
  var instance = new EditorState($config);
  for (var i = 0; i < $config.fields.length; i++)
    { instance[$config.fields[i].name] = $config.fields[i].init(config, instance); }
  return instance
};

// :: (Object) → EditorState
// Create a new state based on this one, but with an adjusted set of
// active plugins. State fields that exist in both sets of plugins
// are kept unchanged. Those that no longer exist are dropped, and
// those that are new are initialized using their
// [`init`](#state.StateField.init) method, passing in the new
// configuration object..
//
// config::- configuration options
//
//   schema:: ?Schema
//   New schema to use.
//
//   plugins:: ?[Plugin]
//   New set of active plugins.
EditorState.prototype.reconfigure = function reconfigure (config) {
    var this$1 = this;

  var $config = new Configuration(config.schema || this.schema, config.plugins);
  var fields = $config.fields, instance = new EditorState($config);
  for (var i = 0; i < fields.length; i++) {
    var name = fields[i].name;
    instance[name] = this$1.hasOwnProperty(name) ? this$1[name] : fields[i].init(config, instance);
  }
  return instance
};

// :: (?union<Object<Plugin>, string, number>) → Object
// Serialize this state to JSON. If you want to serialize the state
// of plugins, pass an object mapping property names to use in the
// resulting JSON object to plugin objects. The argument may also be
// a string or number, in which case it is ignored, to support the
// way `JSON.stringify` calls `toString` methods.
EditorState.prototype.toJSON = function toJSON (pluginFields) {
    var this$1 = this;

  var result = {doc: this.doc.toJSON(), selection: this.selection.toJSON()};
  if (this.storedMarks) { result.storedMarks = this.storedMarks.map(function (m) { return m.toJSON(); }); }
  if (pluginFields && typeof pluginFields == 'object') { for (var prop in pluginFields) {
    if (prop == "doc" || prop == "selection")
      { throw new RangeError("The JSON fields `doc` and `selection` are reserved") }
    var plugin = pluginFields[prop], state = plugin.spec.state;
    if (state && state.toJSON) { result[prop] = state.toJSON.call(plugin, this$1[plugin.key]); }
  } }
  return result
};

// :: (Object, Object, ?Object<Plugin>) → EditorState
// Deserialize a JSON representation of a state. `config` should
// have at least a `schema` field, and should contain array of
// plugins to initialize the state with. `pluginFields` can be used
// to deserialize the state of plugins, by associating plugin
// instances with the property names they use in the JSON object.
//
// config::- configuration options
//
//   schema:: Schema
//   The schema to use.
//
//   plugins:: ?[Plugin]
//   The set of active plugins.
EditorState.fromJSON = function fromJSON (config, json, pluginFields) {
  if (!json) { throw new RangeError("Invalid input for EditorState.fromJSON") }
  if (!config.schema) { throw new RangeError("Required config field 'schema' missing") }
  var $config = new Configuration(config.schema, config.plugins);
  var instance = new EditorState($config);
  $config.fields.forEach(function (field) {
    if (field.name == "doc") {
      instance.doc = prosemirrorModel.Node.fromJSON(config.schema, json.doc);
    } else if (field.name == "selection") {
      instance.selection = Selection.fromJSON(instance.doc, json.selection);
    } else if (field.name == "storedMarks") {
      if (json.storedMarks) { instance.storedMarks = json.storedMarks.map(config.schema.markFromJSON); }
    } else {
      if (pluginFields) { for (var prop in pluginFields) {
        var plugin = pluginFields[prop], state = plugin.spec.state;
        if (plugin.key == field.name && state && state.fromJSON &&
            Object.prototype.hasOwnProperty.call(json, prop)) {
          // This field belongs to a plugin mapped to a JSON field, read it from there.
          instance[field.name] = state.fromJSON.call(plugin, config, json[prop], instance);
          return
        }
      } }
      instance[field.name] = field.init(config, instance);
    }
  });
  return instance
};

// Kludge to allow the view to track mappings between different
// instances of a state.
//
// FIXME this is no longer needed as of prosemirror-view 1.9.0,
// though due to backwards-compat we should probably keep it around
// for a while (if only as a no-op)
EditorState.addApplyListener = function addApplyListener (f) {
  applyListeners.push(f);
};
EditorState.removeApplyListener = function removeApplyListener (f) {
  var found = applyListeners.indexOf(f);
  if (found > -1) { applyListeners.splice(found, 1); }
};

Object.defineProperties( EditorState.prototype, prototypeAccessors$1 );

var applyListeners = [];

// PluginSpec:: interface
//
// This is the type passed to the [`Plugin`](#state.Plugin)
// constructor. It provides a definition for a plugin.
//
//   props:: ?EditorProps
//   The [view props](#view.EditorProps) added by this plugin. Props
//   that are functions will be bound to have the plugin instance as
//   their `this` binding.
//
//   state:: ?StateField<any>
//   Allows a plugin to define a [state field](#state.StateField), an
//   extra slot in the state object in which it can keep its own data.
//
//   key:: ?PluginKey
//   Can be used to make this a keyed plugin. You can have only one
//   plugin with a given key in a given state, but it is possible to
//   access the plugin's configuration and state through the key,
//   without having access to the plugin instance object.
//
//   view:: ?(EditorView) → Object
//   When the plugin needs to interact with the editor view, or
//   set something up in the DOM, use this field. The function
//   will be called when the plugin's state is associated with an
//   editor view.
//
//     return::-
//     Should return an object with the following optional
//     properties:
//
//       update:: ?(view: EditorView, prevState: EditorState)
//       Called whenever the view's state is updated.
//
//       destroy:: ?()
//       Called when the view is destroyed or receives a state
//       with different plugins.
//
//   filterTransaction:: ?(Transaction, EditorState) → bool
//   When present, this will be called before a transaction is
//   applied by the state, allowing the plugin to cancel it (by
//   returning false).
//
//   appendTransaction:: ?(transactions: [Transaction], oldState: EditorState, newState: EditorState) → ?Transaction
//   Allows the plugin to append another transaction to be applied
//   after the given array of transactions. When another plugin
//   appends a transaction after this was called, it is called again
//   with the new state and new transactions—but only the new
//   transactions, i.e. it won't be passed transactions that it
//   already saw.

function bindProps(obj, self, target) {
  for (var prop in obj) {
    var val = obj[prop];
    if (val instanceof Function) { val = val.bind(self); }
    else if (prop == "handleDOMEvents") { val = bindProps(val, self, {}); }
    target[prop] = val;
  }
  return target
}

// ::- Plugins bundle functionality that can be added to an editor.
// They are part of the [editor state](#state.EditorState) and
// may influence that state and the view that contains it.
var Plugin = function Plugin(spec) {
  // :: EditorProps
  // The [props](#view.EditorProps) exported by this plugin.
  this.props = {};
  if (spec.props) { bindProps(spec.props, this, this.props); }
  // :: Object
  // The plugin's [spec object](#state.PluginSpec).
  this.spec = spec;
  this.key = spec.key ? spec.key.key : createKey("plugin");
};

// :: (EditorState) → any
// Extract the plugin's state field from an editor state.
Plugin.prototype.getState = function getState (state) { return state[this.key] };

// StateField:: interface<T>
// A plugin spec may provide a state field (under its
// [`state`](#state.PluginSpec.state) property) of this type, which
// describes the state it wants to keep. Functions provided here are
// always called with the plugin instance as their `this` binding.
//
//   init:: (config: Object, instance: EditorState) → T
//   Initialize the value of the field. `config` will be the object
//   passed to [`EditorState.create`](#state.EditorState^create). Note
//   that `instance` is a half-initialized state instance, and will
//   not have values for plugin fields initialized after this one.
//
//   apply:: (tr: Transaction, value: T, oldState: EditorState, newState: EditorState) → T
//   Apply the given transaction to this state field, producing a new
//   field value. Note that the `newState` argument is again a partially
//   constructed state does not yet contain the state from plugins
//   coming after this one.
//
//   toJSON:: ?(value: T) → *
//   Convert this field to JSON. Optional, can be left off to disable
//   JSON serialization for the field.
//
//   fromJSON:: ?(config: Object, value: *, state: EditorState) → T
//   Deserialize the JSON representation of this field. Note that the
//   `state` argument is again a half-initialized state.

var keys = Object.create(null);

function createKey(name) {
  if (name in keys) { return name + "$" + ++keys[name] }
  keys[name] = 0;
  return name + "$"
}

// ::- A key is used to [tag](#state.PluginSpec.key)
// plugins in a way that makes it possible to find them, given an
// editor state. Assigning a key does mean only one plugin of that
// type can be active in a state.
var PluginKey = function PluginKey(name) {
if ( name === void 0 ) name = "key";
 this.key = createKey(name); };

// :: (EditorState) → ?Plugin
// Get the active plugin with this key, if any, from an editor
// state.
PluginKey.prototype.get = function get (state) { return state.config.pluginsByKey[this.key] };

// :: (EditorState) → ?any
// Get the plugin's state from an editor state.
PluginKey.prototype.getState = function getState (state) { return state[this.key] };

exports.Selection = Selection;
exports.SelectionRange = SelectionRange;
exports.TextSelection = TextSelection;
exports.NodeSelection = NodeSelection;
exports.AllSelection = AllSelection;
exports.Transaction = Transaction;
exports.EditorState = EditorState;
exports.Plugin = Plugin;
exports.PluginKey = PluginKey;
//# sourceMappingURL=index.js.map

},{"prosemirror-model":"../node_modules/prosemirror-model/dist/index.js","prosemirror-transform":"../node_modules/prosemirror-transform/dist/index.js"}],"components/ProseMirror/Editor/Document.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _prosemirrorModel = require("prosemirror-model");

function _default(schema, html, code) {
  var dom = document.createElement("div");
  html = html || "";

  if (code) {
    html = "<pre><code>" + html + "</code></pre>";
  }

  dom.innerHTML = html;
  return _prosemirrorModel.DOMParser.fromSchema(schema).parse(dom);
}

;
},{"prosemirror-model":"../node_modules/prosemirror-model/dist/index.js"}],"../node_modules/prosemirror-view/dist/index.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var prosemirrorModel = require('prosemirror-model');
var prosemirrorState = require('prosemirror-state');
var prosemirrorTransform = require('prosemirror-transform');

var result = {};
if (typeof navigator != "undefined" && typeof document != "undefined") {
  var ie_edge = /Edge\/(\d+)/.exec(navigator.userAgent);
  var ie_upto10 = /MSIE \d/.test(navigator.userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);

  result.mac = /Mac/.test(navigator.platform);
  var ie = result.ie = !!(ie_upto10 || ie_11up || ie_edge);
  result.ie_version = ie_upto10 ? document.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : null;
  result.gecko = !ie && /gecko\/(\d+)/i.test(navigator.userAgent);
  result.gecko_version = result.gecko && +(/Firefox\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1];
  var chrome = !ie && /Chrome\/(\d+)/.exec(navigator.userAgent);
  result.chrome = !!chrome;
  result.chrome_version = chrome && +chrome[1];
  result.ios = !ie && /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  result.android = /Android \d/.test(navigator.userAgent);
  result.webkit = !ie && 'WebkitAppearance' in document.documentElement.style;
  result.safari = /Apple Computer/.test(navigator.vendor);
  result.webkit_version = result.webkit && +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1];
}

var domIndex = function(node) {
  for (var index = 0;; index++) {
    node = node.previousSibling;
    if (!node) { return index }
  }
};

var parentNode = function(node) {
  var parent = node.parentNode;
  return parent && parent.nodeType == 11 ? parent.host : parent
};

var textRange = function(node, from, to) {
  var range = document.createRange();
  range.setEnd(node, to == null ? node.nodeValue.length : to);
  range.setStart(node, from || 0);
  return range
};

// Scans forward and backward through DOM positions equivalent to the
// given one to see if the two are in the same place (i.e. after a
// text node vs at the end of that text node)
var isEquivalentPosition = function(node, off, targetNode, targetOff) {
  return targetNode && (scanFor(node, off, targetNode, targetOff, -1) ||
                        scanFor(node, off, targetNode, targetOff, 1))
};

var atomElements = /^(img|br|input|textarea|hr)$/i;

function scanFor(node, off, targetNode, targetOff, dir) {
  for (;;) {
    if (node == targetNode && off == targetOff) { return true }
    if (off == (dir < 0 ? 0 : nodeSize(node)) || node.nodeType == 3 && node.nodeValue == "\ufeff") {
      var parent = node.parentNode;
      if (parent.nodeType != 1 || hasBlockDesc(node) || atomElements.test(node.nodeName) || node.contentEditable == "false")
        { return false }
      off = domIndex(node) + (dir < 0 ? 0 : 1);
      node = parent;
    } else if (node.nodeType == 1) {
      node = node.childNodes[off + (dir < 0 ? -1 : 0)];
      off = dir < 0 ? nodeSize(node) : 0;
    } else {
      return false
    }
  }
}

function nodeSize(node) {
  return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length
}

function hasBlockDesc(dom) {
  var desc = dom.pmViewDesc;
  return desc && desc.node && desc.node.isBlock
}

// Work around Chrome issue https://bugs.chromium.org/p/chromium/issues/detail?id=447523
// (isCollapsed inappropriately returns true in shadow dom)
var selectionCollapsed = function(domSel) {
  var collapsed = domSel.isCollapsed;
  if (collapsed && result.chrome && domSel.rangeCount && !domSel.getRangeAt(0).collapsed)
    { collapsed = false; }
  return collapsed
};

function keyEvent(keyCode, key) {
  var event = document.createEvent("Event");
  event.initEvent("keydown", true, true);
  event.keyCode = keyCode;
  event.key = event.code = key;
  return event
}

function windowRect(win) {
  return {left: 0, right: win.innerWidth,
          top: 0, bottom: win.innerHeight}
}

function getSide(value, side) {
  return typeof value == "number" ? value : value[side]
}

function scrollRectIntoView(view, rect, startDOM) {
  var scrollThreshold = view.someProp("scrollThreshold") || 0, scrollMargin = view.someProp("scrollMargin") || 5;
  var doc = view.dom.ownerDocument, win = doc.defaultView;
  for (var parent = startDOM || view.dom;; parent = parentNode(parent)) {
    if (!parent) { break }
    if (parent.nodeType != 1) { continue }
    var atTop = parent == doc.body || parent.nodeType != 1;
    var bounding = atTop ? windowRect(win) : parent.getBoundingClientRect();
    var moveX = 0, moveY = 0;
    if (rect.top < bounding.top + getSide(scrollThreshold, "top"))
      { moveY = -(bounding.top - rect.top + getSide(scrollMargin, "top")); }
    else if (rect.bottom > bounding.bottom - getSide(scrollThreshold, "bottom"))
      { moveY = rect.bottom - bounding.bottom + getSide(scrollMargin, "bottom"); }
    if (rect.left < bounding.left + getSide(scrollThreshold, "left"))
      { moveX = -(bounding.left - rect.left + getSide(scrollMargin, "left")); }
    else if (rect.right > bounding.right - getSide(scrollThreshold, "right"))
      { moveX = rect.right - bounding.right + getSide(scrollMargin, "right"); }
    if (moveX || moveY) {
      if (atTop) {
        win.scrollBy(moveX, moveY);
      } else {
        if (moveY) { parent.scrollTop += moveY; }
        if (moveX) { parent.scrollLeft += moveX; }
      }
    }
    if (atTop) { break }
  }
}

// Store the scroll position of the editor's parent nodes, along with
// the top position of an element near the top of the editor, which
// will be used to make sure the visible viewport remains stable even
// when the size of the content above changes.
function storeScrollPos(view) {
  var rect = view.dom.getBoundingClientRect(), startY = Math.max(0, rect.top);
  var doc = view.dom.ownerDocument;
  var refDOM, refTop;
  for (var x = (rect.left + rect.right) / 2, y = startY + 1;
       y < Math.min(innerHeight, rect.bottom); y += 5) {
    var dom = view.root.elementFromPoint(x, y);
    if (dom == view.dom || !view.dom.contains(dom)) { continue }
    var localRect = dom.getBoundingClientRect();
    if (localRect.top >= startY - 20) {
      refDOM = dom;
      refTop = localRect.top;
      break
    }
  }
  var stack = [];
  for (var dom$1 = view.dom; dom$1; dom$1 = parentNode(dom$1)) {
    stack.push({dom: dom$1, top: dom$1.scrollTop, left: dom$1.scrollLeft});
    if (dom$1 == doc.body) { break }
  }
  return {refDOM: refDOM, refTop: refTop, stack: stack}
}

// Reset the scroll position of the editor's parent nodes to that what
// it was before, when storeScrollPos was called.
function resetScrollPos(ref) {
  var refDOM = ref.refDOM;
  var refTop = ref.refTop;
  var stack = ref.stack;

  var newRefTop = refDOM ? refDOM.getBoundingClientRect().top : 0;
  var dTop = newRefTop == 0 ? 0 : newRefTop - refTop;
  for (var i = 0; i < stack.length; i++) {
    var ref$1 = stack[i];
    var dom = ref$1.dom;
    var top = ref$1.top;
    var left = ref$1.left;
    if (dom.scrollTop != top + dTop) { dom.scrollTop = top + dTop; }
    if (dom.scrollLeft != left) { dom.scrollLeft = left; }
  }
}

function findOffsetInNode(node, coords) {
  var closest, dxClosest = 2e8, coordsClosest, offset = 0;
  var rowBot = coords.top, rowTop = coords.top;
  for (var child = node.firstChild, childIndex = 0; child; child = child.nextSibling, childIndex++) {
    var rects = (void 0);
    if (child.nodeType == 1) { rects = child.getClientRects(); }
    else if (child.nodeType == 3) { rects = textRange(child).getClientRects(); }
    else { continue }

    for (var i = 0; i < rects.length; i++) {
      var rect = rects[i];
      if (rect.top <= rowBot && rect.bottom >= rowTop) {
        rowBot = Math.max(rect.bottom, rowBot);
        rowTop = Math.min(rect.top, rowTop);
        var dx = rect.left > coords.left ? rect.left - coords.left
            : rect.right < coords.left ? coords.left - rect.right : 0;
        if (dx < dxClosest) {
          closest = child;
          dxClosest = dx;
          coordsClosest = dx && closest.nodeType == 3 ? {left: rect.right < coords.left ? rect.right : rect.left, top: coords.top} : coords;
          if (child.nodeType == 1 && dx)
            { offset = childIndex + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0); }
          continue
        }
      }
      if (!closest && (coords.left >= rect.right && coords.top >= rect.top ||
                       coords.left >= rect.left && coords.top >= rect.bottom))
        { offset = childIndex + 1; }
    }
  }
  if (closest && closest.nodeType == 3) { return findOffsetInText(closest, coordsClosest) }
  if (!closest || (dxClosest && closest.nodeType == 1)) { return {node: node, offset: offset} }
  return findOffsetInNode(closest, coordsClosest)
}

function findOffsetInText(node, coords) {
  var len = node.nodeValue.length;
  var range = document.createRange();
  for (var i = 0; i < len; i++) {
    range.setEnd(node, i + 1);
    range.setStart(node, i);
    var rect = singleRect(range, 1);
    if (rect.top == rect.bottom) { continue }
    if (inRect(coords, rect))
      { return {node: node, offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0)} }
  }
  return {node: node, offset: 0}
}

function inRect(coords, rect) {
  return coords.left >= rect.left - 1 && coords.left <= rect.right + 1&&
    coords.top >= rect.top - 1 && coords.top <= rect.bottom + 1
}

function targetKludge(dom, coords) {
  var parent = dom.parentNode;
  if (parent && /^li$/i.test(parent.nodeName) && coords.left < dom.getBoundingClientRect().left)
    { return parent }
  return dom
}

function posFromElement(view, elt, coords) {
  var ref = findOffsetInNode(elt, coords);
  var node = ref.node;
  var offset = ref.offset;
  var bias = -1;
  if (node.nodeType == 1 && !node.firstChild) {
    var rect = node.getBoundingClientRect();
    bias = rect.left != rect.right && coords.left > (rect.left + rect.right) / 2 ? 1 : -1;
  }
  return view.docView.posFromDOM(node, offset, bias)
}

function posFromCaret(view, node, offset, coords) {
  // Browser (in caretPosition/RangeFromPoint) will agressively
  // normalize towards nearby inline nodes. Since we are interested in
  // positions between block nodes too, we first walk up the hierarchy
  // of nodes to see if there are block nodes that the coordinates
  // fall outside of. If so, we take the position before/after that
  // block. If not, we call `posFromDOM` on the raw node/offset.
  var outside = -1;
  for (var cur = node;;) {
    if (cur == view.dom) { break }
    var desc = view.docView.nearestDesc(cur, true);
    if (!desc) { return null }
    if (desc.node.isBlock && desc.parent) {
      var rect = desc.dom.getBoundingClientRect();
      if (rect.left > coords.left || rect.top > coords.top) { outside = desc.posBefore; }
      else if (rect.right < coords.left || rect.bottom < coords.top) { outside = desc.posAfter; }
      else { break }
    }
    cur = desc.dom.parentNode;
  }
  return outside > -1 ? outside : view.docView.posFromDOM(node, offset)
}

function elementFromPoint(element, coords, box) {
  var len = element.childNodes.length;
  if (len && box.top < box.bottom) {
    for (var startI = Math.max(0, Math.floor(len * (coords.top - box.top) / (box.bottom - box.top)) - 2), i = startI;;) {
      var child = element.childNodes[i];
      if (child.nodeType == 1) {
        var rects = child.getClientRects();
        for (var j = 0; j < rects.length; j++) {
          var rect = rects[j];
          if (inRect(coords, rect)) { return elementFromPoint(child, coords, rect) }
        }
      }
      if ((i = (i + 1) % len) == startI) { break }
    }
  }
  return element
}

// Given an x,y position on the editor, get the position in the document.
function posAtCoords(view, coords) {
  var root = view.root, node, offset;
  if (root.caretPositionFromPoint) {
    var pos$1 = root.caretPositionFromPoint(coords.left, coords.top);
    if (pos$1) { var assign;
      ((assign = pos$1, node = assign.offsetNode, offset = assign.offset)); }
  }
  if (!node && root.caretRangeFromPoint) {
    var range = root.caretRangeFromPoint(coords.left, coords.top);
    if (range) { var assign$1;
      ((assign$1 = range, node = assign$1.startContainer, offset = assign$1.startOffset)); }
  }

  var elt = root.elementFromPoint(coords.left, coords.top + 1), pos;
  if (!elt || !view.dom.contains(elt.nodeType != 1 ? elt.parentNode : elt)) {
    var box = view.dom.getBoundingClientRect();
    if (!inRect(coords, box)) { return null }
    elt = elementFromPoint(view.dom, coords, box);
    if (!elt) { return null }
  }
  elt = targetKludge(elt, coords);
  if (node) {
    // Suspiciously specific kludge to work around caret*FromPoint
    // never returning a position at the end of the document
    if (node == view.dom && offset == node.childNodes.length - 1 && node.lastChild.nodeType == 1 &&
        coords.top > node.lastChild.getBoundingClientRect().bottom)
      { pos = view.state.doc.content.size; }
    // Ignore positions directly after a BR, since caret*FromPoint
    // 'round up' positions that would be more accurately placed
    // before the BR node.
    else if (offset == 0 || node.nodeType != 1 || node.childNodes[offset - 1].nodeName != "BR")
      { pos = posFromCaret(view, node, offset, coords); }
  }
  if (pos == null) { pos = posFromElement(view, elt, coords); }

  var desc = view.docView.nearestDesc(elt, true);
  return {pos: pos, inside: desc ? desc.posAtStart - desc.border : -1}
}

function singleRect(object, bias) {
  var rects = object.getClientRects();
  return !rects.length ? object.getBoundingClientRect() : rects[bias < 0 ? 0 : rects.length - 1]
}

// : (EditorView, number) → {left: number, top: number, right: number, bottom: number}
// Given a position in the document model, get a bounding box of the
// character at that position, relative to the window.
function coordsAtPos(view, pos) {
  var ref = view.docView.domFromPos(pos);
  var node = ref.node;
  var offset = ref.offset;

  // These browsers support querying empty text ranges
  if (node.nodeType == 3 && (result.chrome || result.gecko)) {
    var rect = singleRect(textRange(node, offset, offset), 0);
    // Firefox returns bad results (the position before the space)
    // when querying a position directly after line-broken
    // whitespace. Detect this situation and and kludge around it
    if (result.gecko && offset && /\s/.test(node.nodeValue[offset - 1]) && offset < node.nodeValue.length) {
      var rectBefore = singleRect(textRange(node, offset - 1, offset - 1), -1);
      if (Math.abs(rectBefore.left - rect.left) < 1 && rectBefore.top == rect.top) {
        var rectAfter = singleRect(textRange(node, offset, offset + 1), -1);
        return flattenV(rectAfter, rectAfter.left < rectBefore.left)
      }
    }
    return rect
  }

  if (node.nodeType == 1 && !view.state.doc.resolve(pos).parent.inlineContent) {
    // Return a horizontal line in block context
    var top = true, rect$1;
    if (offset < node.childNodes.length) {
      var after = node.childNodes[offset];
      if (after.nodeType == 1) { rect$1 = after.getBoundingClientRect(); }
    }
    if (!rect$1 && offset) {
      var before = node.childNodes[offset - 1];
      if (before.nodeType == 1) { rect$1 = before.getBoundingClientRect(); top = false; }
    }
    return flattenH(rect$1 || node.getBoundingClientRect(), top)
  }

  // Not Firefox/Chrome, or not in a text node, so we have to use
  // actual element/character rectangles to get a solution (this part
  // is not very bidi-safe)
  //
  // Try the left side first, fall back to the right one if that
  // doesn't work.
  for (var dir = -1; dir < 2; dir += 2) {
    if (dir < 0 && offset) {
      var prev = (void 0), target = node.nodeType == 3 ? textRange(node, offset - 1, offset)
          : (prev = node.childNodes[offset - 1]).nodeType == 3 ? textRange(prev)
          : prev.nodeType == 1 && prev.nodeName != "BR" ? prev : null; // BR nodes tend to only return the rectangle before them
      if (target) {
        var rect$2 = singleRect(target, 1);
        if (rect$2.top < rect$2.bottom) { return flattenV(rect$2, false) }
      }
    } else if (dir > 0 && offset < nodeSize(node)) {
      var next = (void 0), target$1 = node.nodeType == 3 ? textRange(node, offset, offset + 1)
          : (next = node.childNodes[offset]).nodeType == 3 ? textRange(next)
          : next.nodeType == 1 ? next : null;
      if (target$1) {
        var rect$3 = singleRect(target$1, -1);
        if (rect$3.top < rect$3.bottom) { return flattenV(rect$3, true) }
      }
    }
  }
  // All else failed, just try to get a rectangle for the target node
  return flattenV(singleRect(node.nodeType == 3 ? textRange(node) : node, 0), false)
}

function flattenV(rect, left) {
  if (rect.width == 0) { return rect }
  var x = left ? rect.left : rect.right;
  return {top: rect.top, bottom: rect.bottom, left: x, right: x}
}

function flattenH(rect, top) {
  if (rect.height == 0) { return rect }
  var y = top ? rect.top : rect.bottom;
  return {top: y, bottom: y, left: rect.left, right: rect.right}
}

function withFlushedState(view, state, f) {
  var viewState = view.state, active = view.root.activeElement;
  if (viewState != state) { view.updateState(state); }
  if (active != view.dom) { view.focus(); }
  try {
    return f()
  } finally {
    if (viewState != state) { view.updateState(viewState); }
    if (active != view.dom) { active.focus(); }
  }
}

// : (EditorView, number, number)
// Whether vertical position motion in a given direction
// from a position would leave a text block.
function endOfTextblockVertical(view, state, dir) {
  var sel = state.selection;
  var $pos = dir == "up" ? sel.$anchor.min(sel.$head) : sel.$anchor.max(sel.$head);
  return withFlushedState(view, state, function () {
    var ref = view.docView.domFromPos($pos.pos);
    var dom = ref.node;
    for (;;) {
      var nearest = view.docView.nearestDesc(dom, true);
      if (!nearest) { break }
      if (nearest.node.isBlock) { dom = nearest.dom; break }
      dom = nearest.dom.parentNode;
    }
    var coords = coordsAtPos(view, $pos.pos);
    for (var child = dom.firstChild; child; child = child.nextSibling) {
      var boxes = (void 0);
      if (child.nodeType == 1) { boxes = child.getClientRects(); }
      else if (child.nodeType == 3) { boxes = textRange(child, 0, child.nodeValue.length).getClientRects(); }
      else { continue }
      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        if (box.bottom > box.top && (dir == "up" ? box.bottom < coords.top + 1 : box.top > coords.bottom - 1))
          { return false }
      }
    }
    return true
  })
}

var maybeRTL = /[\u0590-\u08ac]/;

function endOfTextblockHorizontal(view, state, dir) {
  var ref = state.selection;
  var $head = ref.$head;
  if (!$head.parent.isTextblock) { return false }
  var offset = $head.parentOffset, atStart = !offset, atEnd = offset == $head.parent.content.size;
  var sel = getSelection();
  // If the textblock is all LTR, or the browser doesn't support
  // Selection.modify (Edge), fall back to a primitive approach
  if (!maybeRTL.test($head.parent.textContent) || !sel.modify)
    { return dir == "left" || dir == "backward" ? atStart : atEnd }

  return withFlushedState(view, state, function () {
    // This is a huge hack, but appears to be the best we can
    // currently do: use `Selection.modify` to move the selection by
    // one character, and see if that moves the cursor out of the
    // textblock (or doesn't move it at all, when at the start/end of
    // the document).
    var oldRange = sel.getRangeAt(0), oldNode = sel.focusNode, oldOff = sel.focusOffset;
    sel.modify("move", dir, "character");
    var parentDOM = $head.depth ? view.docView.domAfterPos($head.before()) : view.dom;
    var result$$1 = !parentDOM.contains(sel.focusNode.nodeType == 1 ? sel.focusNode : sel.focusNode.parentNode) ||
        (oldNode == sel.focusNode && oldOff == sel.focusOffset);
    // Restore the previous selection
    sel.removeAllRanges();
    sel.addRange(oldRange);
    return result$$1
  })
}

var cachedState = null;
var cachedDir = null;
var cachedResult = false;
function endOfTextblock(view, state, dir) {
  if (cachedState == state && cachedDir == dir) { return cachedResult }
  cachedState = state; cachedDir = dir;
  return cachedResult = dir == "up" || dir == "down"
    ? endOfTextblockVertical(view, state, dir)
    : endOfTextblockHorizontal(view, state, dir)
}

// NodeView:: interface
//
// By default, document nodes are rendered using the result of the
// [`toDOM`](#model.NodeSpec.toDOM) method of their spec, and managed
// entirely by the editor. For some use cases, such as embedded
// node-specific editing interfaces, you want more control over
// the behavior of a node's in-editor representation, and need to
// [define](#view.EditorProps.nodeViews) a custom node view.
//
// Objects returned as node views must conform to this interface.
//
//   dom:: ?dom.Node
//   The outer DOM node that represents the document node. When not
//   given, the default strategy is used to create a DOM node.
//
//   contentDOM:: ?dom.Node
//   The DOM node that should hold the node's content. Only meaningful
//   if the node view also defines a `dom` property and if its node
//   type is not a leaf node type. When this is present, ProseMirror
//   will take care of rendering the node's children into it. When it
//   is not present, the node view itself is responsible for rendering
//   (or deciding not to render) its child nodes.
//
//   update:: ?(node: Node, decorations: [Decoration]) → bool
//   When given, this will be called when the view is updating itself.
//   It will be given a node (possibly of a different type), and an
//   array of active decorations (which are automatically drawn, and
//   the node view may ignore if it isn't interested in them), and
//   should return true if it was able to update to that node, and
//   false otherwise. If the node view has a `contentDOM` property (or
//   no `dom` property), updating its child nodes will be handled by
//   ProseMirror.
//
//   selectNode:: ?()
//   Can be used to override the way the node's selected status (as a
//   node selection) is displayed.
//
//   deselectNode:: ?()
//   When defining a `selectNode` method, you should also provide a
//   `deselectNode` method to remove the effect again.
//
//   setSelection:: ?(anchor: number, head: number, root: dom.Document)
//   This will be called to handle setting the selection inside the
//   node. The `anchor` and `head` positions are relative to the start
//   of the node. By default, a DOM selection will be created between
//   the DOM positions corresponding to those positions, but if you
//   override it you can do something else.
//
//   stopEvent:: ?(event: dom.Event) → bool
//   Can be used to prevent the editor view from trying to handle some
//   or all DOM events that bubble up from the node view. Events for
//   which this returns true are not handled by the editor.
//
//   ignoreMutation:: ?(dom.MutationRecord) → bool
//   Called when a DOM
//   [mutation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
//   happens within the view. Return false if the editor should
//   re-parse the range around the mutation, true if it can safely be
//   ignored.
//
//   destroy:: ?()
//   Called when the node view is removed from the editor or the whole
//   editor is destroyed.

// View descriptions are data structures that describe the DOM that is
// used to represent the editor's content. They are used for:
//
// - Incremental redrawing when the document changes
//
// - Figuring out what part of the document a given DOM position
//   corresponds to
//
// - Wiring in custom implementations of the editing interface for a
//   given node
//
// They form a doubly-linked mutable tree, starting at `view.docView`.

var NOT_DIRTY = 0;
var CHILD_DIRTY = 1;
var CONTENT_DIRTY = 2;
var NODE_DIRTY = 3;

// Superclass for the various kinds of descriptions. Defines their
// basic structure and shared methods.
var ViewDesc = function ViewDesc(parent, children, dom, contentDOM) {
  this.parent = parent;
  this.children = children;
  this.dom = dom;
  // An expando property on the DOM node provides a link back to its
  // description.
  dom.pmViewDesc = this;
  // This is the node that holds the child views. It may be null for
  // descs that don't have children.
  this.contentDOM = contentDOM;
  this.dirty = NOT_DIRTY;
};

var prototypeAccessors$1 = { beforePosition: {},size: {},border: {},posBefore: {},posAtStart: {},posAfter: {},posAtEnd: {},contentLost: {} };

// Used to check whether a given description corresponds to a
// widget/mark/node.
ViewDesc.prototype.matchesWidget = function matchesWidget () { return false };
ViewDesc.prototype.matchesMark = function matchesMark () { return false };
ViewDesc.prototype.matchesNode = function matchesNode () { return false };
ViewDesc.prototype.matchesHack = function matchesHack () { return false };

prototypeAccessors$1.beforePosition.get = function () { return false };

// : () → ?ParseRule
// When parsing in-editor content (in domchange.js), we allow
// descriptions to determine the parse rules that should be used to
// parse them.
ViewDesc.prototype.parseRule = function parseRule () { return null };

// : (dom.Event) → bool
// Used by the editor's event handler to ignore events that come
// from certain descs.
ViewDesc.prototype.stopEvent = function stopEvent () { return false };

// The size of the content represented by this desc.
prototypeAccessors$1.size.get = function () {
    var this$1 = this;

  var size = 0;
  for (var i = 0; i < this.children.length; i++) { size += this$1.children[i].size; }
  return size
};

// For block nodes, this represents the space taken up by their
// start/end tokens.
prototypeAccessors$1.border.get = function () { return 0 };

ViewDesc.prototype.destroy = function destroy () {
    var this$1 = this;

  this.parent = null;
  if (this.dom.pmViewDesc == this) { this.dom.pmViewDesc = null; }
  for (var i = 0; i < this.children.length; i++)
    { this$1.children[i].destroy(); }
};

ViewDesc.prototype.posBeforeChild = function posBeforeChild (child) {
    var this$1 = this;

  for (var i = 0, pos = this.posAtStart; i < this.children.length; i++) {
    var cur = this$1.children[i];
    if (cur == child) { return pos }
    pos += cur.size;
  }
};

prototypeAccessors$1.posBefore.get = function () {
  return this.parent.posBeforeChild(this)
};

prototypeAccessors$1.posAtStart.get = function () {
  return this.parent ? this.parent.posBeforeChild(this) + this.border : 0
};

prototypeAccessors$1.posAfter.get = function () {
  return this.posBefore + this.size
};

prototypeAccessors$1.posAtEnd.get = function () {
  return this.posAtStart + this.size - 2 * this.border
};

// : (dom.Node, number, ?number) → number
ViewDesc.prototype.localPosFromDOM = function localPosFromDOM (dom, offset, bias) {
    var this$1 = this;

  // If the DOM position is in the content, use the child desc after
  // it to figure out a position.
  if (this.contentDOM && this.contentDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode)) {
    if (bias < 0) {
      var domBefore, desc;
      if (dom == this.contentDOM) {
        domBefore = dom.childNodes[offset - 1];
      } else {
        while (dom.parentNode != this.contentDOM) { dom = dom.parentNode; }
        domBefore = dom.previousSibling;
      }
      while (domBefore && !((desc = domBefore.pmViewDesc) && desc.parent == this)) { domBefore = domBefore.previousSibling; }
      return domBefore ? this.posBeforeChild(desc) + desc.size : this.posAtStart
    } else {
      var domAfter, desc$1;
      if (dom == this.contentDOM) {
        domAfter = dom.childNodes[offset];
      } else {
        while (dom.parentNode != this.contentDOM) { dom = dom.parentNode; }
        domAfter = dom.nextSibling;
      }
      while (domAfter && !((desc$1 = domAfter.pmViewDesc) && desc$1.parent == this)) { domAfter = domAfter.nextSibling; }
      return domAfter ? this.posBeforeChild(desc$1) : this.posAtEnd
    }
  }
  // Otherwise, use various heuristics, falling back on the bias
  // parameter, to determine whether to return the position at the
  // start or at the end of this view desc.
  var atEnd;
  if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) {
    atEnd = dom.compareDocumentPosition(this.contentDOM) & 2;
  } else if (this.dom.firstChild) {
    if (offset == 0) { for (var search = dom;; search = search.parentNode) {
      if (search == this$1.dom) { atEnd = false; break }
      if (search.parentNode.firstChild != search) { break }
    } }
    if (atEnd == null && offset == dom.childNodes.length) { for (var search$1 = dom;; search$1 = search$1.parentNode) {
      if (search$1 == this$1.dom) { atEnd = true; break }
      if (search$1.parentNode.lastChild != search$1) { break }
    } }
  }
  return (atEnd == null ? bias > 0 : atEnd) ? this.posAtEnd : this.posAtStart
};

// Scan up the dom finding the first desc that is a descendant of
// this one.
ViewDesc.prototype.nearestDesc = function nearestDesc (dom, onlyNodes) {
    var this$1 = this;

  for (var first = true, cur = dom; cur; cur = cur.parentNode) {
    var desc = this$1.getDesc(cur);
    if (desc && (!onlyNodes || desc.node)) {
      // If dom is outside of this desc's nodeDOM, don't count it.
      if (first && desc.nodeDOM && !(desc.nodeDOM.nodeType == 1 ? desc.nodeDOM.contains(dom) : desc.nodeDOM == dom)) { first = false; }
      else { return desc }
    }
  }
};

ViewDesc.prototype.getDesc = function getDesc (dom) {
    var this$1 = this;

  var desc = dom.pmViewDesc;
  for (var cur = desc; cur; cur = cur.parent) { if (cur == this$1) { return desc } }
};

ViewDesc.prototype.posFromDOM = function posFromDOM (dom, offset, bias) {
    var this$1 = this;

  for (var scan = dom;; scan = scan.parentNode) {
    var desc = this$1.getDesc(scan);
    if (desc) { return desc.localPosFromDOM(dom, offset, bias) }
  }
};

// : (number) → ?NodeViewDesc
// Find the desc for the node after the given pos, if any. (When a
// parent node overrode rendering, there might not be one.)
ViewDesc.prototype.descAt = function descAt (pos) {
    var this$1 = this;

  for (var i = 0, offset = 0; i < this.children.length; i++) {
    var child = this$1.children[i], end = offset + child.size;
    if (offset == pos && end != offset) {
      while (!child.border && child.children.length) { child = child.children[0]; }
      return child
    }
    if (pos < end) { return child.descAt(pos - offset - child.border) }
    offset = end;
  }
};

// : (number) → {node: dom.Node, offset: number}
ViewDesc.prototype.domFromPos = function domFromPos (pos) {
    var this$1 = this;

  if (!this.contentDOM) { return {node: this.dom, offset: 0} }
  for (var offset = 0, i = 0;; i++) {
    if (offset == pos) {
      while (i < this.children.length && (this.children[i].beforePosition || this.children[i].dom.parentNode != this.contentDOM)) { i++; }
      return {node: this$1.contentDOM,
              offset: i == this$1.children.length ? this$1.contentDOM.childNodes.length : domIndex(this$1.children[i].dom)}
    }
    if (i == this$1.children.length) { throw new Error("Invalid position " + pos) }
    var child = this$1.children[i], end = offset + child.size;
    if (pos < end) { return child.domFromPos(pos - offset - child.border) }
    offset = end;
  }
};

// Used to find a DOM range in a single parent for a given changed
// range.
ViewDesc.prototype.parseRange = function parseRange (from, to, base) {
    var this$1 = this;
    if ( base === void 0 ) base = 0;

  if (this.children.length == 0)
    { return {node: this.contentDOM, from: from, to: to, fromOffset: 0, toOffset: this.contentDOM.childNodes.length} }

  var fromOffset = -1, toOffset = -1;
  for (var offset = base, i = 0;; i++) {
    var child = this$1.children[i], end = offset + child.size;
    if (fromOffset == -1 && from <= end) {
      var childBase = offset + child.border;
      // FIXME maybe descend mark views to parse a narrower range?
      if (from >= childBase && to <= end - child.border && child.node &&
          child.contentDOM && this$1.contentDOM.contains(child.contentDOM))
        { return child.parseRange(from, to, childBase) }

      from = offset;
      for (var j = i; j > 0; j--) {
        var prev = this$1.children[j - 1];
        if (prev.size && prev.dom.parentNode == this$1.contentDOM && !prev.emptyChildAt(1)) {
          fromOffset = domIndex(prev.dom) + 1;
          break
        }
        from -= prev.size;
      }
      if (fromOffset == -1) { fromOffset = 0; }
    }
    if (fromOffset > -1 && to <= end) {
      to = end;
      for (var j$1 = i + 1; j$1 < this.children.length; j$1++) {
        var next = this$1.children[j$1];
        if (next.size && next.dom.parentNode == this$1.contentDOM && !next.emptyChildAt(-1)) {
          toOffset = domIndex(next.dom);
          break
        }
        to += next.size;
      }
      if (toOffset == -1) { toOffset = this$1.contentDOM.childNodes.length; }
      break
    }
    offset = end;
  }
  return {node: this.contentDOM, from: from, to: to, fromOffset: fromOffset, toOffset: toOffset}
};

ViewDesc.prototype.emptyChildAt = function emptyChildAt (side) {
  if (this.border || !this.contentDOM || !this.children.length) { return false }
  var child = this.children[side < 0 ? 0 : this.children.length - 1];
  return child.size == 0 || child.emptyChildAt(side)
};

// : (number) → dom.Node
ViewDesc.prototype.domAfterPos = function domAfterPos (pos) {
  var ref = this.domFromPos(pos);
    var node = ref.node;
    var offset = ref.offset;
  if (node.nodeType != 1 || offset == node.childNodes.length)
    { throw new RangeError("No node after pos " + pos) }
  return node.childNodes[offset]
};

// : (number, number, dom.Document)
// View descs are responsible for setting any selection that falls
// entirely inside of them, so that custom implementations can do
// custom things with the selection. Note that this falls apart when
// a selection starts in such a node and ends in another, in which
// case we just use whatever domFromPos produces as a best effort.
ViewDesc.prototype.setSelection = function setSelection (anchor, head, root, force) {
    var this$1 = this;

  // If the selection falls entirely in a child, give it to that child
  var from = Math.min(anchor, head), to = Math.max(anchor, head);
  for (var i = 0, offset = 0; i < this.children.length; i++) {
    var child = this$1.children[i], end = offset + child.size;
    if (from > offset && to < end)
      { return child.setSelection(anchor - offset - child.border, head - offset - child.border, root, force) }
    offset = end;
  }

  var anchorDOM = this.domFromPos(anchor), headDOM = this.domFromPos(head);
  var domSel = root.getSelection(), range = document.createRange();
  if (!force &&
      isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset) &&
      isEquivalentPosition(headDOM.node, headDOM.offset, domSel.focusNode, domSel.focusOffset))
    { return }

  // Selection.extend can be used to create an 'inverted' selection
  // (one where the focus is before the anchor), but not all
  // browsers support it yet.
  if (domSel.extend) {
    range.setEnd(anchorDOM.node, anchorDOM.offset);
    range.collapse(false);
  } else {
    if (anchor > head) { var tmp = anchorDOM; anchorDOM = headDOM; headDOM = tmp; }
    range.setEnd(headDOM.node, headDOM.offset);
    range.setStart(anchorDOM.node, anchorDOM.offset);
  }
  domSel.removeAllRanges();
  domSel.addRange(range);
  if (domSel.extend)
    { domSel.extend(headDOM.node, headDOM.offset); }
};

// : (dom.MutationRecord) → bool
ViewDesc.prototype.ignoreMutation = function ignoreMutation (_mutation) {
  return !this.contentDOM
};

prototypeAccessors$1.contentLost.get = function () {
  return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM)
};

// Remove a subtree of the element tree that has been touched
// by a DOM change, so that the next update will redraw it.
ViewDesc.prototype.markDirty = function markDirty (from, to) {
    var this$1 = this;

  for (var offset = 0, i = 0; i < this.children.length; i++) {
    var child = this$1.children[i], end = offset + child.size;
    if (offset == end ? from <= end && to >= offset : from < end && to > offset) {
      var startInside = offset + child.border, endInside = end - child.border;
      if (from >= startInside && to <= endInside) {
        this$1.dirty = from == offset || to == end ? CONTENT_DIRTY : CHILD_DIRTY;
        if (from == startInside && to == endInside && child.contentLost) { child.dirty = NODE_DIRTY; }
        else { child.markDirty(from - startInside, to - startInside); }
        return
      } else {
        child.dirty = NODE_DIRTY;
      }
    }
    offset = end;
  }
  this.dirty = CONTENT_DIRTY;
};

ViewDesc.prototype.markParentsDirty = function markParentsDirty () {
  var level = 1;
  for (var node = this.parent; node; node = node.parent) {
    var dirty = level == 1 ? CONTENT_DIRTY : CHILD_DIRTY;
    if (node.dirty < dirty) { node.dirty = dirty; }
  }
};

Object.defineProperties( ViewDesc.prototype, prototypeAccessors$1 );

// Reused array to avoid allocating fresh arrays for things that will
// stay empty anyway.
var nothing = [];

// A widget desc represents a widget decoration, which is a DOM node
// drawn between the document nodes.
var WidgetViewDesc = (function (ViewDesc) {
  function WidgetViewDesc(parent, widget, view, pos) {
    var self, dom = widget.type.toDOM;
    if (typeof dom == "function") { dom = dom(view, function () {
      if (!self) { return pos }
      if (self.parent) { return self.parent.posBeforeChild(self) }
    }); }
    if (!widget.type.spec.raw) {
      if (dom.nodeType != 1) {
        var wrap = document.createElement("span");
        wrap.appendChild(dom);
        dom = wrap;
      }
      dom.contentEditable = false;
      dom.classList.add("ProseMirror-widget");
    }
    ViewDesc.call(this, parent, nothing, dom, null);
    this.widget = widget;
    self = this;
  }

  if ( ViewDesc ) WidgetViewDesc.__proto__ = ViewDesc;
  WidgetViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  WidgetViewDesc.prototype.constructor = WidgetViewDesc;

  var prototypeAccessors$1 = { beforePosition: {} };

  prototypeAccessors$1.beforePosition.get = function () {
    return this.widget.type.side < 0
  };

  WidgetViewDesc.prototype.matchesWidget = function matchesWidget (widget) {
    return this.dirty == NOT_DIRTY && widget.type.eq(this.widget.type)
  };

  WidgetViewDesc.prototype.parseRule = function parseRule () { return {ignore: true} };

  WidgetViewDesc.prototype.stopEvent = function stopEvent (event) {
    var stop = this.widget.spec.stopEvent;
    return stop ? stop(event) : false
  };

  Object.defineProperties( WidgetViewDesc.prototype, prototypeAccessors$1 );

  return WidgetViewDesc;
}(ViewDesc));

// A cursor wrapper is used to put the cursor in when newly typed text
// needs to be styled differently from its surrounding text (for
// example through storedMarks), so that the style of the text doesn't
// visually 'pop' between typing it and actually updating the view.
var CursorWrapperDesc = (function (WidgetViewDesc) {
  function CursorWrapperDesc () {
    WidgetViewDesc.apply(this, arguments);
  }

  if ( WidgetViewDesc ) CursorWrapperDesc.__proto__ = WidgetViewDesc;
  CursorWrapperDesc.prototype = Object.create( WidgetViewDesc && WidgetViewDesc.prototype );
  CursorWrapperDesc.prototype.constructor = CursorWrapperDesc;

  CursorWrapperDesc.prototype.parseRule = function parseRule () { return {skip: withoutZeroWidthSpaces(this.dom)} };

  CursorWrapperDesc.prototype.ignoreMutation = function ignoreMutation () { return false };

  return CursorWrapperDesc;
}(WidgetViewDesc));

var CompositionViewDesc = (function (ViewDesc) {
  function CompositionViewDesc(parent, dom, textDOM, text) {
    ViewDesc.call(this, parent, nothing, dom, null);
    this.textDOM = textDOM;
    this.text = text;
  }

  if ( ViewDesc ) CompositionViewDesc.__proto__ = ViewDesc;
  CompositionViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  CompositionViewDesc.prototype.constructor = CompositionViewDesc;

  var prototypeAccessors$2 = { size: {} };

  prototypeAccessors$2.size.get = function () { return this.text.length };

  CompositionViewDesc.prototype.parseRule = function parseRule () { return {skip: withoutZeroWidthSpaces(this.dom)} };

  CompositionViewDesc.prototype.localPosFromDOM = function localPosFromDOM (dom, offset) {
    if (dom != this.textDOM) { return this.posAtStart + (offset ? this.size : 0) }
    var zwsp = this.textDOM.nodeValue.indexOf("\ufeff");
    return this.posAtStart + offset - (zwsp > -1 && zwsp < offset ? 1 : 0)
  };

  CompositionViewDesc.prototype.domFromPos = function domFromPos (pos) {
    var zwsp = this.textDOM.nodeValue.indexOf("\ufeff");
    return {node: this.textDOM, offset: pos + (zwsp > -1 && zwsp <= pos ? 1 : 0)}
  };

  CompositionViewDesc.prototype.ignoreMutation = function ignoreMutation () { return false };

  Object.defineProperties( CompositionViewDesc.prototype, prototypeAccessors$2 );

  return CompositionViewDesc;
}(ViewDesc));

// A mark desc represents a mark. May have multiple children,
// depending on how the mark is split. Note that marks are drawn using
// a fixed nesting order, for simplicity and predictability, so in
// some cases they will be split more often than would appear
// necessary.
var MarkViewDesc = (function (ViewDesc) {
  function MarkViewDesc(parent, mark, dom, contentDOM) {
    ViewDesc.call(this, parent, [], dom, contentDOM);
    this.mark = mark;
  }

  if ( ViewDesc ) MarkViewDesc.__proto__ = ViewDesc;
  MarkViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  MarkViewDesc.prototype.constructor = MarkViewDesc;

  MarkViewDesc.create = function create (parent, mark, inline, view) {
    var custom = view.nodeViews[mark.type.name];
    var spec = custom && custom(mark, view, inline);
    if (!spec || !spec.dom)
      { spec = prosemirrorModel.DOMSerializer.renderSpec(document, mark.type.spec.toDOM(mark, inline)); }
    return new MarkViewDesc(parent, mark, spec.dom, spec.contentDOM || spec.dom)
  };

  MarkViewDesc.prototype.parseRule = function parseRule () { return {mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM} };

  MarkViewDesc.prototype.matchesMark = function matchesMark (mark) { return this.dirty != NODE_DIRTY && this.mark.eq(mark) };

  MarkViewDesc.prototype.markDirty = function markDirty (from, to) {
    ViewDesc.prototype.markDirty.call(this, from, to);
    // Move dirty info to nearest node view
    if (this.dirty != NOT_DIRTY) {
      var parent = this.parent;
      while (!parent.node) { parent = parent.parent; }
      if (parent.dirty < this.dirty) { parent.dirty = this.dirty; }
      this.dirty = NOT_DIRTY;
    }
  };

  MarkViewDesc.prototype.slice = function slice (from, to, view) {
    var copy = MarkViewDesc.create(this.parent, this.mark, true, view);
    var nodes = this.children, size = this.size;
    if (to < size) { nodes = replaceNodes(nodes, to, size, view); }
    if (from > 0) { nodes = replaceNodes(nodes, 0, from, view); }
    for (var i = 0; i < nodes.length; i++) { nodes[i].parent = copy; }
    copy.children = nodes;
    return copy
  };

  return MarkViewDesc;
}(ViewDesc));

// Node view descs are the main, most common type of view desc, and
// correspond to an actual node in the document. Unlike mark descs,
// they populate their child array themselves.
var NodeViewDesc = (function (ViewDesc) {
  function NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos) {
    ViewDesc.call(this, parent, node.isLeaf ? nothing : [], dom, contentDOM);
    this.nodeDOM = nodeDOM;
    this.node = node;
    this.outerDeco = outerDeco;
    this.innerDeco = innerDeco;
    if (contentDOM) { this.updateChildren(view, pos); }
  }

  if ( ViewDesc ) NodeViewDesc.__proto__ = ViewDesc;
  NodeViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  NodeViewDesc.prototype.constructor = NodeViewDesc;

  var prototypeAccessors$3 = { size: {},border: {} };

  // By default, a node is rendered using the `toDOM` method from the
  // node type spec. But client code can use the `nodeViews` spec to
  // supply a custom node view, which can influence various aspects of
  // the way the node works.
  //
  // (Using subclassing for this was intentionally decided against,
  // since it'd require exposing a whole slew of finnicky
  // implementation details to the user code that they probably will
  // never need.)
  NodeViewDesc.create = function create (parent, node, outerDeco, innerDeco, view, pos) {
    var custom = view.nodeViews[node.type.name], descObj;
    var spec = custom && custom(node, view, function () {
      // (This is a function that allows the custom view to find its
      // own position)
      if (!descObj) { return pos }
      if (descObj.parent) { return descObj.parent.posBeforeChild(descObj) }
    }, outerDeco);

    var dom = spec && spec.dom, contentDOM = spec && spec.contentDOM;
    if (node.isText) {
      if (!dom) { dom = document.createTextNode(node.text); }
      else if (dom.nodeType != 3) { throw new RangeError("Text must be rendered as a DOM text node") }
    } else if (!dom) {
      var assign;
      ((assign = prosemirrorModel.DOMSerializer.renderSpec(document, node.type.spec.toDOM(node)), dom = assign.dom, contentDOM = assign.contentDOM));
    }
    if (!contentDOM && !node.isText && dom.nodeName != "BR") { // Chrome gets confused by <br contenteditable=false>
      if (!dom.hasAttribute("contenteditable")) { dom.contentEditable = false; }
      if (node.type.spec.draggable) { dom.draggable = true; }
    }

    var nodeDOM = dom;
    dom = applyOuterDeco(dom, outerDeco, node);

    if (spec)
      { return descObj = new CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM,
                                              spec, view, pos + 1) }
    else if (node.isText)
      { return new TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) }
    else
      { return new NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos + 1) }
  };

  NodeViewDesc.prototype.parseRule = function parseRule () {
    var this$1 = this;

    // Experimental kludge to allow opt-in re-parsing of nodes
    if (this.node.type.spec.reparseInView) { return null }
    // FIXME the assumption that this can always return the current
    // attrs means that if the user somehow manages to change the
    // attrs in the dom, that won't be picked up. Not entirely sure
    // whether this is a problem
    var rule = {node: this.node.type.name, attrs: this.node.attrs};
    if (this.node.type.spec.code) { rule.preserveWhitespace = "full"; }
    if (this.contentDOM && !this.contentLost) { rule.contentElement = this.contentDOM; }
    else { rule.getContent = function () { return this$1.contentDOM ? prosemirrorModel.Fragment.empty : this$1.node.content; }; }
    return rule
  };

  NodeViewDesc.prototype.matchesNode = function matchesNode (node, outerDeco, innerDeco) {
    return this.dirty == NOT_DIRTY && node.eq(this.node) &&
      sameOuterDeco(outerDeco, this.outerDeco) && innerDeco.eq(this.innerDeco)
  };

  prototypeAccessors$3.size.get = function () { return this.node.nodeSize };

  prototypeAccessors$3.border.get = function () { return this.node.isLeaf ? 0 : 1 };

  // Syncs `this.children` to match `this.node.content` and the local
  // decorations, possibly introducing nesting for marks. Then, in a
  // separate step, syncs the DOM inside `this.contentDOM` to
  // `this.children`.
  NodeViewDesc.prototype.updateChildren = function updateChildren (view, pos) {
    var this$1 = this;

    var inline = this.node.inlineContent, off = pos;
    var composition = inline && view.composing && this.localCompositionNode(view, pos);
    var updater = new ViewTreeUpdater(this, composition && composition.node);
    iterDeco(this.node, this.innerDeco, function (widget, i) {
      if (widget.spec.marks)
        { updater.syncToMarks(widget.spec.marks, inline, view); }
      else if (widget.type.side >= 0)
        { updater.syncToMarks(i == this$1.node.childCount ? prosemirrorModel.Mark.none : this$1.node.child(i).marks, inline, view); }
      // If the next node is a desc matching this widget, reuse it,
      // otherwise insert the widget as a new view desc.
      updater.placeWidget(widget, view, off);
    }, function (child, outerDeco, innerDeco, i) {
      // Make sure the wrapping mark descs match the node's marks.
      updater.syncToMarks(child.marks, inline, view);
      // Either find an existing desc that exactly matches this node,
      // and drop the descs before it.
      updater.findNodeMatch(child, outerDeco, innerDeco, i) ||
        // Or try updating the next desc to reflect this node.
        updater.updateNextNode(child, outerDeco, innerDeco, view, i) ||
        // Or just add it as a new desc.
        updater.addNode(child, outerDeco, innerDeco, view, off);
      off += child.nodeSize;
    });
    // Drop all remaining descs after the current position.
    updater.syncToMarks(nothing, inline, view);
    if (this.node.isTextblock) { updater.addTextblockHacks(); }
    updater.destroyRest();

    // Sync the DOM if anything changed
    if (updater.changed || this.dirty == CONTENT_DIRTY) {
      // May have to protect focused DOM from being changed if a composition is active
      if (composition) { this.protectLocalComposition(view, composition); }
      this.renderChildren();
    }
  };

  NodeViewDesc.prototype.renderChildren = function renderChildren () {
    renderDescs(this.contentDOM, this.children, NodeViewDesc.is);
    if (result.ios) { iosHacks(this.dom); }
  };

  NodeViewDesc.prototype.localCompositionNode = function localCompositionNode (view, pos) {
    // Only do something if both the selection and a focused text node
    // are inside of this node, and the node isn't already part of a
    // view that's a child of this view
    var ref = view.state.selection;
    var from = ref.from;
    var to = ref.to;
    if (!(view.state.selection instanceof prosemirrorState.TextSelection) || from < pos || to > pos + this.node.content.size) { return }
    var sel = view.root.getSelection();
    var textNode = nearbyTextNode(sel.focusNode, sel.focusOffset);
    if (!textNode || !this.dom.contains(textNode.parentNode)) { return }

    // Find the text in the focused node in the node, stop if it's not
    // there (may have been modified through other means, in which
    // case it should overwritten)
    var text = textNode.nodeValue.replace(/\ufeff/g, "");
    var textPos = findTextInFragment(this.node.content, text, from - pos, to - pos);

    return textPos < 0 ? null : {node: textNode, pos: textPos, text: text}
  };

  NodeViewDesc.prototype.protectLocalComposition = function protectLocalComposition (view, ref) {
    var this$1 = this;
    var node = ref.node;
    var pos = ref.pos;
    var text = ref.text;

    // The node is already part of a local view desc, leave it there
    if (this.getDesc(node)) { return }

    // Create a composition view for the orphaned nodes
    var topNode = node;
    for (;; topNode = topNode.parentNode) {
      if (topNode.parentNode == this$1.contentDOM) { break }
      while (topNode.previousSibling) { topNode.parentNode.removeChild(topNode.previousSibling); }
      while (topNode.nextSibling) { topNode.parentNode.removeChild(topNode.nextSibling); }
      if (topNode.pmViewDesc) { topNode.pmViewDesc = null; }
    }
    var desc = new CompositionViewDesc(this, topNode, node, text);
    view.compositionNodes.push(desc);

    // Patch up this.children to contain the composition view
    this.children = replaceNodes(this.children, pos, pos + text.length, view, desc);
  };

  // : (Node, [Decoration], DecorationSet, EditorView) → bool
  // If this desc be updated to match the given node decoration,
  // do so and return true.
  NodeViewDesc.prototype.update = function update (node, outerDeco, innerDeco, view) {
    if (this.dirty == NODE_DIRTY ||
        !node.sameMarkup(this.node)) { return false }
    this.updateInner(node, outerDeco, innerDeco, view);
    return true
  };

  NodeViewDesc.prototype.updateInner = function updateInner (node, outerDeco, innerDeco, view) {
    this.updateOuterDeco(outerDeco);
    this.node = node;
    this.innerDeco = innerDeco;
    if (this.contentDOM) { this.updateChildren(view, this.posAtStart); }
    this.dirty = NOT_DIRTY;
  };

  NodeViewDesc.prototype.updateOuterDeco = function updateOuterDeco (outerDeco) {
    if (sameOuterDeco(outerDeco, this.outerDeco)) { return }
    var needsWrap = this.nodeDOM.nodeType != 1;
    var oldDOM = this.dom;
    this.dom = patchOuterDeco(this.dom, this.nodeDOM,
                              computeOuterDeco(this.outerDeco, this.node, needsWrap),
                              computeOuterDeco(outerDeco, this.node, needsWrap));
    if (this.dom != oldDOM) {
      oldDOM.pmViewDesc = null;
      this.dom.pmViewDesc = this;
    }
    this.outerDeco = outerDeco;
  };

  // Mark this node as being the selected node.
  NodeViewDesc.prototype.selectNode = function selectNode () {
    this.nodeDOM.classList.add("ProseMirror-selectednode");
    if (this.contentDOM || !this.node.type.spec.draggable) { this.dom.draggable = true; }
  };

  // Remove selected node marking from this node.
  NodeViewDesc.prototype.deselectNode = function deselectNode () {
    this.nodeDOM.classList.remove("ProseMirror-selectednode");
    if (this.contentDOM || !this.node.type.spec.draggable) { this.dom.draggable = false; }
  };

  Object.defineProperties( NodeViewDesc.prototype, prototypeAccessors$3 );

  return NodeViewDesc;
}(ViewDesc));

// Create a view desc for the top-level document node, to be exported
// and used by the view class.
function docViewDesc(doc, outerDeco, innerDeco, dom, view) {
  applyOuterDeco(dom, outerDeco, doc);
  return new NodeViewDesc(null, doc, outerDeco, innerDeco, dom, dom, dom, view, 0)
}

var TextViewDesc = (function (NodeViewDesc) {
  function TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) {
    NodeViewDesc.call(this, parent, node, outerDeco, innerDeco, dom, null, nodeDOM, view);
  }

  if ( NodeViewDesc ) TextViewDesc.__proto__ = NodeViewDesc;
  TextViewDesc.prototype = Object.create( NodeViewDesc && NodeViewDesc.prototype );
  TextViewDesc.prototype.constructor = TextViewDesc;

  TextViewDesc.prototype.parseRule = function parseRule () {
    var parent = this.nodeDOM.parentNode;
    return parent ? {skip: parent} : {ignore: true}
  };

  TextViewDesc.prototype.update = function update (node, outerDeco) {
    if (this.dirty == NODE_DIRTY || (this.dirty != NOT_DIRTY && !this.inParent()) ||
        !node.sameMarkup(this.node)) { return false }
    this.updateOuterDeco(outerDeco);
    if ((this.dirty != NOT_DIRTY || node.text != this.node.text) && node.text != this.nodeDOM.nodeValue)
      { this.nodeDOM.nodeValue = node.text; }
    this.node = node;
    this.dirty = NOT_DIRTY;
    return true
  };

  TextViewDesc.prototype.inParent = function inParent () {
    var parentDOM = this.parent.contentDOM;
    for (var n = this.nodeDOM; n; n = n.parentNode) { if (n == parentDOM) { return true } }
    return false
  };

  TextViewDesc.prototype.domFromPos = function domFromPos (pos) {
    return {node: this.nodeDOM, offset: pos}
  };

  TextViewDesc.prototype.localPosFromDOM = function localPosFromDOM (dom, offset, bias) {
    if (dom == this.nodeDOM) { return this.posAtStart + Math.min(offset, this.node.text.length) }
    return NodeViewDesc.prototype.localPosFromDOM.call(this, dom, offset, bias)
  };

  TextViewDesc.prototype.ignoreMutation = function ignoreMutation (mutation) {
    return mutation.type != "characterData"
  };

  TextViewDesc.prototype.slice = function slice (from, to, view) {
    var node = this.node.cut(from, to), dom = document.createTextNode(node.text);
    return new TextViewDesc(this.parent, node, this.outerDeco, this.innerDeco, dom, dom, view)
  };

  return TextViewDesc;
}(NodeViewDesc));

// A dummy desc used to tag trailing BR or span nodes created to work
// around contentEditable terribleness.
var BRHackViewDesc = (function (ViewDesc) {
  function BRHackViewDesc () {
    ViewDesc.apply(this, arguments);
  }

  if ( ViewDesc ) BRHackViewDesc.__proto__ = ViewDesc;
  BRHackViewDesc.prototype = Object.create( ViewDesc && ViewDesc.prototype );
  BRHackViewDesc.prototype.constructor = BRHackViewDesc;

  BRHackViewDesc.prototype.parseRule = function parseRule () { return {ignore: true} };
  BRHackViewDesc.prototype.matchesHack = function matchesHack () { return this.dirty == NOT_DIRTY };

  return BRHackViewDesc;
}(ViewDesc));

// A separate subclass is used for customized node views, so that the
// extra checks only have to be made for nodes that are actually
// customized.
var CustomNodeViewDesc = (function (NodeViewDesc) {
  function CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, spec, view, pos) {
    NodeViewDesc.call(this, parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos);
    this.spec = spec;
  }

  if ( NodeViewDesc ) CustomNodeViewDesc.__proto__ = NodeViewDesc;
  CustomNodeViewDesc.prototype = Object.create( NodeViewDesc && NodeViewDesc.prototype );
  CustomNodeViewDesc.prototype.constructor = CustomNodeViewDesc;

  // A custom `update` method gets to decide whether the update goes
  // through. If it does, and there's a `contentDOM` node, our logic
  // updates the children.
  CustomNodeViewDesc.prototype.update = function update (node, outerDeco, innerDeco, view) {
    if (this.dirty == NODE_DIRTY) { return false }
    if (this.spec.update) {
      var result$$1 = this.spec.update(node, outerDeco);
      if (result$$1) { this.updateInner(node, outerDeco, innerDeco, view); }
      return result$$1
    } else if (!this.contentDOM && !node.isLeaf) {
      return false
    } else {
      return NodeViewDesc.prototype.update.call(this, node, outerDeco, innerDeco, view)
    }
  };

  CustomNodeViewDesc.prototype.selectNode = function selectNode () {
    this.spec.selectNode ? this.spec.selectNode() : NodeViewDesc.prototype.selectNode.call(this);
  };

  CustomNodeViewDesc.prototype.deselectNode = function deselectNode () {
    this.spec.deselectNode ? this.spec.deselectNode() : NodeViewDesc.prototype.deselectNode.call(this);
  };

  CustomNodeViewDesc.prototype.setSelection = function setSelection (anchor, head, root, force) {
    this.spec.setSelection ? this.spec.setSelection(anchor, head, root)
      : NodeViewDesc.prototype.setSelection.call(this, anchor, head, root, force);
  };

  CustomNodeViewDesc.prototype.destroy = function destroy () {
    if (this.spec.destroy) { this.spec.destroy(); }
    NodeViewDesc.prototype.destroy.call(this);
  };

  CustomNodeViewDesc.prototype.stopEvent = function stopEvent (event) {
    return this.spec.stopEvent ? this.spec.stopEvent(event) : false
  };

  CustomNodeViewDesc.prototype.ignoreMutation = function ignoreMutation (mutation) {
    return this.spec.ignoreMutation ? this.spec.ignoreMutation(mutation) : NodeViewDesc.prototype.ignoreMutation.call(this, mutation)
  };

  return CustomNodeViewDesc;
}(NodeViewDesc));

// : (dom.Node, [ViewDesc])
// Sync the content of the given DOM node with the nodes associated
// with the given array of view descs, recursing into mark descs
// because this should sync the subtree for a whole node at a time.
function renderDescs(parentDOM, descs) {
  var dom = parentDOM.firstChild;
  for (var i = 0; i < descs.length; i++) {
    var desc = descs[i], childDOM = desc.dom;
    if (childDOM.parentNode == parentDOM) {
      while (childDOM != dom) { dom = rm(dom); }
      dom = dom.nextSibling;
    } else {
      parentDOM.insertBefore(childDOM, dom);
    }
    if (desc instanceof MarkViewDesc) {
      var pos = dom ? dom.previousSibling : parentDOM.lastChild;
      renderDescs(desc.contentDOM, desc.children);
      dom = pos ? pos.nextSibling : parentDOM.firstChild;
    }
  }
  while (dom) { dom = rm(dom); }
}

function OuterDecoLevel(nodeName) {
  if (nodeName) { this.nodeName = nodeName; }
}
OuterDecoLevel.prototype = Object.create(null);

var noDeco = [new OuterDecoLevel];

function computeOuterDeco(outerDeco, node, needsWrap) {
  if (outerDeco.length == 0) { return noDeco }

  var top = needsWrap ? noDeco[0] : new OuterDecoLevel, result$$1 = [top];

  for (var i = 0; i < outerDeco.length; i++) {
    var attrs = outerDeco[i].type.attrs, cur = top;
    if (!attrs) { continue }
    if (attrs.nodeName)
      { result$$1.push(cur = new OuterDecoLevel(attrs.nodeName)); }

    for (var name in attrs) {
      var val = attrs[name];
      if (val == null) { continue }
      if (needsWrap && result$$1.length == 1)
        { result$$1.push(cur = top = new OuterDecoLevel(node.isInline ? "span" : "div")); }
      if (name == "class") { cur.class = (cur.class ? cur.class + " " : "") + val; }
      else if (name == "style") { cur.style = (cur.style ? cur.style + ";" : "") + val; }
      else if (name != "nodeName") { cur[name] = val; }
    }
  }

  return result$$1
}

function patchOuterDeco(outerDOM, nodeDOM, prevComputed, curComputed) {
  // Shortcut for trivial case
  if (prevComputed == noDeco && curComputed == noDeco) { return nodeDOM }

  var curDOM = nodeDOM;
  for (var i = 0; i < curComputed.length; i++) {
    var deco = curComputed[i], prev = prevComputed[i];
    if (i) {
      var parent = (void 0);
      if (prev && prev.nodeName == deco.nodeName && curDOM != outerDOM &&
          (parent = nodeDOM.parentNode) && parent.tagName.toLowerCase() == deco.nodeName) {
        curDOM = parent;
      } else {
        parent = document.createElement(deco.nodeName);
        parent.appendChild(curDOM);
        curDOM = parent;
      }
    }
    patchAttributes(curDOM, prev || noDeco[0], deco);
  }
  return curDOM
}

function patchAttributes(dom, prev, cur) {
  for (var name in prev)
    { if (name != "class" && name != "style" && name != "nodeName" && !(name in cur))
      { dom.removeAttribute(name); } }
  for (var name$1 in cur)
    { if (name$1 != "class" && name$1 != "style" && name$1 != "nodeName" && cur[name$1] != prev[name$1])
      { dom.setAttribute(name$1, cur[name$1]); } }
  if (prev.class != cur.class) {
    var prevList = prev.class ? prev.class.split(" ") : nothing;
    var curList = cur.class ? cur.class.split(" ") : nothing;
    for (var i = 0; i < prevList.length; i++) { if (curList.indexOf(prevList[i]) == -1)
      { dom.classList.remove(prevList[i]); } }
    for (var i$1 = 0; i$1 < curList.length; i$1++) { if (prevList.indexOf(curList[i$1]) == -1)
      { dom.classList.add(curList[i$1]); } }
  }
  if (prev.style != cur.style) {
    if (prev.style) {
      var prop = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, m;
      while (m = prop.exec(prev.style))
        { dom.style[m[1].toLowerCase()] = ""; }
    }
    if (cur.style)
      { dom.style.cssText += cur.style; }
  }
}

function applyOuterDeco(dom, deco, node) {
  return patchOuterDeco(dom, dom, noDeco, computeOuterDeco(deco, node, dom.nodeType != 1))
}

// : ([Decoration], [Decoration]) → bool
function sameOuterDeco(a, b) {
  if (a.length != b.length) { return false }
  for (var i = 0; i < a.length; i++) { if (!a[i].type.eq(b[i].type)) { return false } }
  return true
}

// Remove a DOM node and return its next sibling.
function rm(dom) {
  var next = dom.nextSibling;
  dom.parentNode.removeChild(dom);
  return next
}

// Helper class for incrementally updating a tree of mark descs and
// the widget and node descs inside of them.
var ViewTreeUpdater = function ViewTreeUpdater(top, lockedNode) {
  this.top = top;
  this.lock = lockedNode;
  // Index into `this.top`'s child array, represents the current
  // update position.
  this.index = 0;
  // When entering a mark, the current top and index are pushed
  // onto this.
  this.stack = [];
  // Tracks whether anything was changed
  this.changed = false;

  var pre = preMatch(top.node.content, top.children);
  this.preMatched = pre.nodes;
  this.preMatchOffset = pre.offset;
};

ViewTreeUpdater.prototype.getPreMatch = function getPreMatch (index) {
  return index >= this.preMatchOffset ? this.preMatched[index - this.preMatchOffset] : null
};

// Destroy and remove the children between the given indices in
// `this.top`.
ViewTreeUpdater.prototype.destroyBetween = function destroyBetween (start, end) {
    var this$1 = this;

  if (start == end) { return }
  for (var i = start; i < end; i++) { this$1.top.children[i].destroy(); }
  this.top.children.splice(start, end - start);
  this.changed = true;
};

// Destroy all remaining children in `this.top`.
ViewTreeUpdater.prototype.destroyRest = function destroyRest () {
  this.destroyBetween(this.index, this.top.children.length);
};

// : ([Mark], EditorView)
// Sync the current stack of mark descs with the given array of
// marks, reusing existing mark descs when possible.
ViewTreeUpdater.prototype.syncToMarks = function syncToMarks (marks, inline, view) {
    var this$1 = this;

  var keep = 0, depth = this.stack.length >> 1;
  var maxKeep = Math.min(depth, marks.length);
  while (keep < maxKeep &&
         (keep == depth - 1 ? this.top : this.stack[(keep + 1) << 1]).matchesMark(marks[keep]) && marks[keep].type.spec.spanning !== false)
    { keep++; }

  while (keep < depth) {
    this$1.destroyRest();
    this$1.top.dirty = NOT_DIRTY;
    this$1.index = this$1.stack.pop();
    this$1.top = this$1.stack.pop();
    depth--;
  }
  while (depth < marks.length) {
    this$1.stack.push(this$1.top, this$1.index + 1);
    var found = -1;
    for (var i = this.index; i < Math.min(this.index + 3, this.top.children.length); i++) {
      if (this$1.top.children[i].matchesMark(marks[depth])) { found = i; break }
    }
    if (found > -1) {
      if (found > this$1.index) {
        this$1.changed = true;
        this$1.top.children.splice(this$1.index, found - this$1.index);
      }
      this$1.top = this$1.top.children[this$1.index];
    } else {
      var markDesc = MarkViewDesc.create(this$1.top, marks[depth], inline, view);
      this$1.top.children.splice(this$1.index, 0, markDesc);
      this$1.top = markDesc;
      this$1.changed = true;
    }
    this$1.index = 0;
    depth++;
  }
};

// : (Node, [Decoration], DecorationSet) → bool
// Try to find a node desc matching the given data. Skip over it and
// return true when successful.
ViewTreeUpdater.prototype.findNodeMatch = function findNodeMatch (node, outerDeco, innerDeco, index) {
    var this$1 = this;

  var found = -1, preMatch = index < 0 ? undefined : this.getPreMatch(index), children = this.top.children;
  if (preMatch && preMatch.matchesNode(node, outerDeco, innerDeco)) {
    found = children.indexOf(preMatch);
  } else {
    for (var i = this.index, e = Math.min(children.length, i + 5); i < e; i++) {
      var child = children[i];
      if (child.matchesNode(node, outerDeco, innerDeco) && this$1.preMatched.indexOf(child) < 0) {
        found = i;
        break
      }
    }
  }
  if (found < 0) { return false }
  this.destroyBetween(this.index, found);
  this.index++;
  return true
};

// : (Node, [Decoration], DecorationSet, EditorView, Fragment, number) → bool
// Try to update the next node, if any, to the given data. Checks
// pre-matches to avoid overwriting nodes that could still be used.
ViewTreeUpdater.prototype.updateNextNode = function updateNextNode (node, outerDeco, innerDeco, view, index) {
  if (this.index == this.top.children.length) { return false }
  var next = this.top.children[this.index];
  if (next instanceof NodeViewDesc) {
    var preMatch = this.preMatched.indexOf(next);
    if (preMatch > -1 && preMatch + this.preMatchOffset != index) { return false }
    var nextDOM = next.dom;

    // Can't update if nextDOM is or contains this.lock, except if
    // it's a text node whose content already matches the new text
    // and whose decorations match the new ones.
    var locked = this.lock && (nextDOM == this.lock || nextDOM.nodeType == 1 && nextDOM.contains(this.lock.parentNode)) &&
        !(node.isText && next.node && next.node.isText && next.nodeDOM.nodeValue == node.text &&
          next.dirty != NODE_DIRTY && sameOuterDeco(outerDeco, next.outerDeco));
    if (!locked && next.update(node, outerDeco, innerDeco, view)) {
      if (next.dom != nextDOM) { this.changed = true; }
      this.index++;
      return true
    }
  }
  return false
};

// : (Node, [Decoration], DecorationSet, EditorView)
// Insert the node as a newly created node desc.
ViewTreeUpdater.prototype.addNode = function addNode (node, outerDeco, innerDeco, view, pos) {
  this.top.children.splice(this.index++, 0, NodeViewDesc.create(this.top, node, outerDeco, innerDeco, view, pos));
  this.changed = true;
};

ViewTreeUpdater.prototype.placeWidget = function placeWidget (widget, view, pos) {
  if (this.index < this.top.children.length && this.top.children[this.index].matchesWidget(widget)) {
    this.index++;
  } else {
    var desc = new (widget.spec.isCursorWrapper ? CursorWrapperDesc : WidgetViewDesc)(this.top, widget, view, pos);
    this.top.children.splice(this.index++, 0, desc);
    this.changed = true;
  }
};

ViewTreeUpdater.prototype.placeComposition = function placeComposition (view, desc) {
  this.syncToMarks(nothing, true, view);
  if (this.top.children[this.index] == desc) { this.index++; }
  else { this.top.children.splice(this.index++, 0, desc); this.changed = true; }
};

// Make sure a textblock looks and behaves correctly in
// contentEditable.
ViewTreeUpdater.prototype.addTextblockHacks = function addTextblockHacks () {
  var lastChild = this.top.children[this.index - 1];
  while (lastChild instanceof MarkViewDesc) { lastChild = lastChild.children[lastChild.children.length - 1]; }

  if (!lastChild || // Empty textblock
      !(lastChild instanceof TextViewDesc) ||
      /\n$/.test(lastChild.node.text)) {
    if (this.index < this.top.children.length && this.top.children[this.index].matchesHack()) {
      this.index++;
    } else {
      var dom = document.createElement("br");
      this.top.children.splice(this.index++, 0, new BRHackViewDesc(this.top, nothing, dom, null));
      this.changed = true;
    }
  }
};

// : (Fragment, [ViewDesc]) → [ViewDesc]
// Iterate from the end of the fragment and array of descs to find
// directly matching ones, in order to avoid overeagerly reusing
// those for other nodes. Returns an array whose positions correspond
// to node positions in the fragment, and whose elements are either
// descs matched to the child at that index, or empty.
function preMatch(frag, descs) {
  var result$$1 = [], end = frag.childCount;
  for (var i = descs.length - 1; end > 0 && i >= 0; i--) {
    var desc = descs[i], node = desc.node;
    if (!node) { continue }
    if (node != frag.child(end - 1)) { break }
    result$$1.push(desc);
    --end;
  }
  return {nodes: result$$1.reverse(), offset: end}
}

function compareSide(a, b) { return a.type.side - b.type.side }

// : (ViewDesc, DecorationSet, (Decoration, number), (Node, [Decoration], DecorationSet, number))
// This function abstracts iterating over the nodes and decorations in
// a fragment. Calls `onNode` for each node, with its local and child
// decorations. Splits text nodes when there is a decoration starting
// or ending inside of them. Calls `onWidget` for each widget.
function iterDeco(parent, deco, onWidget, onNode) {
  var locals = deco.locals(parent), offset = 0;
  // Simple, cheap variant for when there are no local decorations
  if (locals.length == 0) {
    for (var i = 0; i < parent.childCount; i++) {
      var child = parent.child(i);
      onNode(child, locals, deco.forChild(offset, child), i);
      offset += child.nodeSize;
    }
    return
  }

  var decoIndex = 0, active = [], restNode = null;
  for (var parentIndex = 0;;) {
    if (decoIndex < locals.length && locals[decoIndex].to == offset) {
      var widget = locals[decoIndex++], widgets = (void 0);
      while (decoIndex < locals.length && locals[decoIndex].to == offset)
        { (widgets || (widgets = [widget])).push(locals[decoIndex++]); }
      if (widgets) {
        widgets.sort(compareSide);
        for (var i$1 = 0; i$1 < widgets.length; i$1++) { onWidget(widgets[i$1], parentIndex); }
      } else {
        onWidget(widget, parentIndex);
      }
    }

    var child$1 = (void 0), index = (void 0);
    if (restNode) {
      index = -1;
      child$1 = restNode;
      restNode = null;
    } else if (parentIndex < parent.childCount) {
      index = parentIndex;
      child$1 = parent.child(parentIndex++);
    } else {
      break
    }

    for (var i$2 = 0; i$2 < active.length; i$2++) { if (active[i$2].to <= offset) { active.splice(i$2--, 1); } }
    while (decoIndex < locals.length && locals[decoIndex].from == offset) { active.push(locals[decoIndex++]); }

    var end = offset + child$1.nodeSize;
    if (child$1.isText) {
      var cutAt = end;
      if (decoIndex < locals.length && locals[decoIndex].from < cutAt) { cutAt = locals[decoIndex].from; }
      for (var i$3 = 0; i$3 < active.length; i$3++) { if (active[i$3].to < cutAt) { cutAt = active[i$3].to; } }
      if (cutAt < end) {
        restNode = child$1.cut(cutAt - offset);
        child$1 = child$1.cut(0, cutAt - offset);
        end = cutAt;
        index = -1;
      }
    }

    onNode(child$1, active.length ? active.slice() : nothing, deco.forChild(offset, child$1), index);
    offset = end;
  }
}

// List markers in Mobile Safari will mysteriously disappear
// sometimes. This works around that.
function iosHacks(dom) {
  if (dom.nodeName == "UL" || dom.nodeName == "OL") {
    var oldCSS = dom.style.cssText;
    dom.style.cssText = oldCSS + "; list-style: square !important";
    window.getComputedStyle(dom).listStyle;
    dom.style.cssText = oldCSS;
  }
}

function nearbyTextNode(node, offset) {
  for (;;) {
    if (node.nodeType == 3) { return node }
    if (node.nodeType == 1 && offset > 0) {
      node = node.childNodes[offset - 1];
      offset = nodeSize(node);
    } else if (node.nodeType == 1 && offset < node.childNodes.length) {
      node = node.childNodes[offset];
      offset = 0;
    } else {
      return null
    }
  }
}

// Find a piece of text in an inline fragment, overlapping from-to
function findTextInFragment(frag, text, from, to) {
  for (var str = "", i = 0, childPos = 0; i < frag.childCount; i++) {
    var child = frag.child(i), end = childPos + child.nodeSize;
    if (child.isText) {
      str += child.text;
      if (end >= to) {
        var strStart = end - str.length, found = str.lastIndexOf(text);
        while (found > -1 && strStart + found > from) { found = str.lastIndexOf(text, found - 1); }
        if (found > -1 && strStart + found + text.length >= to) {
          return strStart + found
        } else if (end > to - text.length) {
          break
        }
      }
    } else {
      str = "";
    }
    childPos = end;
  }
  return -1
}

// Replace range from-to in an array of view descs with replacement
// (may be null to just delete). This goes very much against the grain
// of the rest of this code, which tends to create nodes with the
// right shape in one go, rather than messing with them after
// creation, but is necessary in the composition hack.
function replaceNodes(nodes, from, to, view, replacement) {
  var result$$1 = [];
  for (var i = 0, off = 0; i < nodes.length; i++) {
    var child = nodes[i], start = off, end = off += child.size;
    if (start >= to || end <= from) {
      result$$1.push(child);
    } else {
      if (start < from) { result$$1.push(child.slice(0, from - start, view)); }
      if (replacement) {
        result$$1.push(replacement);
        replacement = null;
      }
      if (end > to) { result$$1.push(child.slice(to - start, child.size, view)); }
    }
  }
  return result$$1
}

function withoutZeroWidthSpaces(dom) {
  var clone = dom.cloneNode(true);
  function scan(node) {
    if (node.nodeType == 1)
      { for (var child = node.firstChild; child; child = child.nextSibling) { scan(child); } }
    else if (node.nodeType == 3)
      { node.nodeValue = node.nodeValue.replace(/\ufeff/g, ""); }
  }
  scan(clone);
  return clone
}

function moveSelectionBlock(state, dir) {
  var ref = state.selection;
  var $anchor = ref.$anchor;
  var $head = ref.$head;
  var $side = dir > 0 ? $anchor.max($head) : $anchor.min($head);
  var $start = !$side.parent.inlineContent ? $side : $side.depth ? state.doc.resolve(dir > 0 ? $side.after() : $side.before()) : null;
  return $start && prosemirrorState.Selection.findFrom($start, dir)
}

function apply(view, sel) {
  view.dispatch(view.state.tr.setSelection(sel).scrollIntoView());
  return true
}

function selectHorizontally(view, dir, mods) {
  var sel = view.state.selection;
  if (sel instanceof prosemirrorState.TextSelection) {
    if (!sel.empty || mods.indexOf("s") > -1) {
      return false
    } else if (view.endOfTextblock(dir > 0 ? "right" : "left")) {
      var next = moveSelectionBlock(view.state, dir);
      if (next && (next instanceof prosemirrorState.NodeSelection)) { return apply(view, next) }
      return false
    } else {
      var $head = sel.$head, node = $head.textOffset ? null : dir < 0 ? $head.nodeBefore : $head.nodeAfter, desc;
      if (!node || node.isText) { return false }
      var nodePos = dir < 0 ? $head.pos - node.nodeSize : $head.pos;
      if (!(node.isAtom || (desc = view.docView.descAt(nodePos)) && !desc.contentDOM)) { return false }
      if (prosemirrorState.NodeSelection.isSelectable(node)) {
        return apply(view, new prosemirrorState.NodeSelection(dir < 0 ? view.state.doc.resolve($head.pos - node.nodeSize) : $head))
      } else if (result.webkit) {
        // Chrome and Safari will introduce extra pointless cursor
        // positions around inline uneditable nodes, so we have to
        // take over and move the cursor past them (#937)
        return apply(view, new prosemirrorState.TextSelection(view.state.doc.resolve(dir < 0 ? nodePos : nodePos + node.nodeSize)))
      } else {
        return false
      }
    }
  } else if (sel instanceof prosemirrorState.NodeSelection && sel.node.isInline) {
    return apply(view, new prosemirrorState.TextSelection(dir > 0 ? sel.$to : sel.$from))
  } else {
    var next$1 = moveSelectionBlock(view.state, dir);
    if (next$1) { return apply(view, next$1) }
    return false
  }
}

function nodeLen(node) {
  return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length
}

function isIgnorable(dom) {
  var desc = dom.pmViewDesc;
  return desc && desc.size == 0 && (dom.nextSibling || dom.nodeName != "BR")
}

// Make sure the cursor isn't directly after one or more ignored
// nodes, which will confuse the browser's cursor motion logic.
function skipIgnoredNodesLeft(view) {
  var sel = view.root.getSelection();
  var node = sel.focusNode, offset = sel.focusOffset;
  if (!node) { return }
  var moveNode, moveOffset, force = false;
  // Gecko will do odd things when the selection is directly in front
  // of a non-editable node, so in that case, move it into the next
  // node if possible. Issue prosemirror/prosemirror#832.
  if (result.gecko && node.nodeType == 1 && offset < nodeLen(node) && isIgnorable(node.childNodes[offset])) { force = true; }
  for (;;) {
    if (offset > 0) {
      if (node.nodeType != 1) {
        if (node.nodeType == 3 && node.nodeValue.charAt(offset - 1) == "\ufeff") {
          // IE11's cursor will still be stuck when placed at the
          // beginning of the cursor wrapper text node (#807)
          if (result.ie && result.ie_version <= 11) { force = true; }
          moveNode = node;
          moveOffset = --offset;
        } else { break }
      } else {
        var before = node.childNodes[offset - 1];
        if (isIgnorable(before)) {
          moveNode = node;
          moveOffset = --offset;
        } else if (before.nodeType == 3) {
          node = before;
          offset = node.nodeValue.length;
        } else { break }
      }
    } else if (isBlockNode(node)) {
      break
    } else {
      var prev = node.previousSibling;
      while (prev && isIgnorable(prev)) {
        moveNode = node.parentNode;
        moveOffset = domIndex(prev);
        prev = prev.previousSibling;
      }
      if (!prev) {
        node = node.parentNode;
        if (node == view.dom) { break }
        offset = 0;
      } else {
        node = prev;
        offset = nodeLen(node);
      }
    }
  }
  if (force) { setSelFocus(view, sel, node, offset); }
  else if (moveNode) { setSelFocus(view, sel, moveNode, moveOffset); }
}

// Make sure the cursor isn't directly before one or more ignored
// nodes.
function skipIgnoredNodesRight(view) {
  var sel = view.root.getSelection();
  var node = sel.focusNode, offset = sel.focusOffset;
  if (!node) { return }
  var len = nodeLen(node);
  var moveNode, moveOffset;
  for (;;) {
    if (offset < len) {
      if (node.nodeType != 1) { break }
      var after = node.childNodes[offset];
      if (isIgnorable(after)) {
        moveNode = node;
        moveOffset = ++offset;
      }
      else { break }
    } else if (isBlockNode(node)) {
      break
    } else {
      var next = node.nextSibling;
      while (next && isIgnorable(next)) {
        moveNode = next.parentNode;
        moveOffset = domIndex(next) + 1;
        next = next.nextSibling;
      }
      if (!next) {
        node = node.parentNode;
        if (node == view.dom) { break }
        offset = len = 0;
      } else {
        node = next;
        offset = 0;
        len = nodeLen(node);
      }
    }
  }
  if (moveNode) { setSelFocus(view, sel, moveNode, moveOffset); }
}

function isBlockNode(dom) {
  var desc = dom.pmViewDesc;
  return desc && desc.node && desc.node.isBlock
}

function setSelFocus(view, sel, node, offset) {
  if (selectionCollapsed(sel)) {
    var range = document.createRange();
    range.setEnd(node, offset);
    range.setStart(node, offset);
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (sel.extend) {
    sel.extend(node, offset);
  }
  view.domObserver.setCurSelection();
}

// : (EditorState, number)
// Check whether vertical selection motion would involve node
// selections. If so, apply it (if not, the result is left to the
// browser)
function selectVertically(view, dir, mods) {
  var sel = view.state.selection;
  if (sel instanceof prosemirrorState.TextSelection && !sel.empty || mods.indexOf("s") > -1) { return false }
  var $from = sel.$from;
  var $to = sel.$to;

  if (!$from.parent.inlineContent || view.endOfTextblock(dir < 0 ? "up" : "down")) {
    var next = moveSelectionBlock(view.state, dir);
    if (next && (next instanceof prosemirrorState.NodeSelection))
      { return apply(view, next) }
  }
  if (!$from.parent.inlineContent) {
    var beyond = prosemirrorState.Selection.findFrom(dir < 0 ? $from : $to, dir);
    return beyond ? apply(view, beyond) : true
  }
  return false
}

function stopNativeHorizontalDelete(view, dir) {
  if (!(view.state.selection instanceof prosemirrorState.TextSelection)) { return true }
  var ref = view.state.selection;
  var $head = ref.$head;
  var $anchor = ref.$anchor;
  var empty = ref.empty;
  if (!$head.sameParent($anchor)) { return true }
  if (!empty) { return false }
  if (view.endOfTextblock(dir > 0 ? "forward" : "backward")) { return true }
  var nextNode = !$head.textOffset && (dir < 0 ? $head.nodeBefore : $head.nodeAfter);
  if (nextNode && !nextNode.isText) {
    var tr = view.state.tr;
    if (dir < 0) { tr.delete($head.pos - nextNode.nodeSize, $head.pos); }
    else { tr.delete($head.pos, $head.pos + nextNode.nodeSize); }
    view.dispatch(tr);
    return true
  }
  return false
}

function switchEditable(view, node, state) {
  view.domObserver.stop();
  node.contentEditable = state;
  view.domObserver.start();
}

// Issue #867 / https://bugs.chromium.org/p/chromium/issues/detail?id=903821
// In which Chrome does really wrong things when the down arrow is
// pressed when the cursor is directly at the start of a textblock and
// has an uneditable node after it
function chromeDownArrowBug(view) {
  if (!result.chrome || view.state.selection.$head.parentOffset > 0) { return }
  var ref = view.root.getSelection();
  var focusNode = ref.focusNode;
  var focusOffset = ref.focusOffset;
  if (focusNode && focusNode.nodeType == 1 && focusOffset == 0 &&
      focusNode.firstChild && focusNode.firstChild.contentEditable == "false") {
    var child = focusNode.firstChild;
    switchEditable(view, child, true);
    setTimeout(function () { return switchEditable(view, child, false); }, 20);
  }
}

// A backdrop key mapping used to make sure we always suppress keys
// that have a dangerous default effect, even if the commands they are
// bound to return false, and to make sure that cursor-motion keys
// find a cursor (as opposed to a node selection) when pressed. For
// cursor-motion keys, the code in the handlers also takes care of
// block selections.

function getMods(event) {
  var result$$1 = "";
  if (event.ctrlKey) { result$$1 += "c"; }
  if (event.metaKey) { result$$1 += "m"; }
  if (event.altKey) { result$$1 += "a"; }
  if (event.shiftKey) { result$$1 += "s"; }
  return result$$1
}

function captureKeyDown(view, event) {
  var code = event.keyCode, mods = getMods(event);
  if (code == 8 || (result.mac && code == 72 && mods == "c")) { // Backspace, Ctrl-h on Mac
    return stopNativeHorizontalDelete(view, -1) || skipIgnoredNodesLeft(view)
  } else if (code == 46 || (result.mac && code == 68 && mods == "c")) { // Delete, Ctrl-d on Mac
    return stopNativeHorizontalDelete(view, 1) || skipIgnoredNodesRight(view)
  } else if (code == 13 || code == 27) { // Enter, Esc
    return true
  } else if (code == 37) { // Left arrow
    return selectHorizontally(view, -1, mods) || skipIgnoredNodesLeft(view)
  } else if (code == 39) { // Right arrow
    return selectHorizontally(view, 1, mods) || skipIgnoredNodesRight(view)
  } else if (code == 38) { // Up arrow
    return selectVertically(view, -1, mods) || skipIgnoredNodesLeft(view)
  } else if (code == 40) { // Down arrow
    return chromeDownArrowBug(view) || selectVertically(view, 1, mods) || skipIgnoredNodesRight(view)
  } else if (mods == (result.mac ? "m" : "c") &&
             (code == 66 || code == 73 || code == 89 || code == 90)) { // Mod-[biyz]
    return true
  }
  return false
}

function selectionFromDOM(view, origin) {
  var domSel = view.root.getSelection(), doc = view.state.doc;
  var nearestDesc = view.docView.nearestDesc(domSel.focusNode), inWidget = nearestDesc && nearestDesc.size == 0;
  var head = view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
  var $head = doc.resolve(head), $anchor, selection;
  if (selectionCollapsed(domSel)) {
    $anchor = $head;
    while (nearestDesc && !nearestDesc.node) { nearestDesc = nearestDesc.parent; }
    if (nearestDesc && nearestDesc.node.isAtom && prosemirrorState.NodeSelection.isSelectable(nearestDesc.node) && nearestDesc.parent) {
      var pos = nearestDesc.posBefore;
      selection = new prosemirrorState.NodeSelection(head == pos ? $head : doc.resolve(pos));
    }
  } else {
    $anchor = doc.resolve(view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset));
  }

  if (!selection) {
    var bias = origin == "pointer" || (view.state.selection.head < $head.pos && !inWidget) ? 1 : -1;
    selection = selectionBetween(view, $anchor, $head, bias);
  }
  return selection
}

function selectionToDOM(view, takeFocus, force) {
  var sel = view.state.selection;
  syncNodeSelection(view, sel);

  if (view.editable && !view.hasFocus()) {
    if (!takeFocus) { return }
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=921444
    if (result.gecko && result.gecko_version <= 55) {
      view.domObserver.disconnectSelection();
      view.dom.focus();
      view.domObserver.connectSelection();
    }
  } else if (!view.editable && !hasSelection(view) && !takeFocus) {
    return
  }

  view.domObserver.disconnectSelection();

  if (view.cursorWrapper) {
    selectCursorWrapper(view);
  } else {
    var anchor = sel.anchor;
    var head = sel.head;
    var resetEditableFrom, resetEditableTo;
    if (brokenSelectBetweenUneditable && !(sel instanceof prosemirrorState.TextSelection)) {
      if (!sel.$from.parent.inlineContent)
        { resetEditableFrom = temporarilyEditableNear(view, sel.from); }
      if (!sel.empty && !sel.$from.parent.inlineContent)
        { resetEditableTo = temporarilyEditableNear(view, sel.to); }
    }
    view.docView.setSelection(anchor, head, view.root, force);
    if (brokenSelectBetweenUneditable) {
      if (resetEditableFrom) { resetEditableFrom.contentEditable = "false"; }
      if (resetEditableTo) { resetEditableTo.contentEditable = "false"; }
    }
    if (sel.visible) {
      view.dom.classList.remove("ProseMirror-hideselection");
    } else if (anchor != head) {
      view.dom.classList.add("ProseMirror-hideselection");
      if ("onselectionchange" in document) { removeClassOnSelectionChange(view); }
    }
  }

  view.domObserver.setCurSelection();
  view.domObserver.connectSelection();
}

// Kludge to work around Webkit not allowing a selection to start/end
// between non-editable block nodes. We briefly make something
// editable, set the selection, then set it uneditable again.

var brokenSelectBetweenUneditable = result.safari || result.chrome && result.chrome_version < 63;

function temporarilyEditableNear(view, pos) {
  var ref = view.docView.domFromPos(pos);
  var node = ref.node;
  var offset = ref.offset;
  var after = offset < node.childNodes.length ? node.childNodes[offset] : null;
  var before = offset ? node.childNodes[offset - 1] : null;
  if ((!after || after.contentEditable == "false") && (!before || before.contentEditable == "false")) {
    if (after) {
      after.contentEditable = "true";
      return after
    } else if (before) {
      before.contentEditable = "true";
      return before
    }
  }
}

function removeClassOnSelectionChange(view) {
  var doc = view.dom.ownerDocument;
  doc.removeEventListener("selectionchange", view.hideSelectionGuard);
  var domSel = view.root.getSelection();
  var node = domSel.anchorNode, offset = domSel.anchorOffset;
  doc.addEventListener("selectionchange", view.hideSelectionGuard = function () {
    if (domSel.anchorNode != node || domSel.anchorOffset != offset) {
      doc.removeEventListener("selectionchange", view.hideSelectionGuard);
      view.dom.classList.remove("ProseMirror-hideselection");
    }
  });
}

function selectCursorWrapper(view) {
  var domSel = view.root.getSelection(), range = document.createRange();
  var node = view.cursorWrapper.dom;
  range.setEnd(node, node.childNodes.length);
  range.collapse(false);
  domSel.removeAllRanges();
  domSel.addRange(range);
  // Kludge to kill 'control selection' in IE11 when selecting an
  // invisible cursor wrapper, since that would result in those weird
  // resize handles and a selection that considers the absolutely
  // positioned wrapper, rather than the root editable node, the
  // focused element.
  if (!view.state.selection.visible && result.ie && result.ie_version <= 11) {
    node.disabled = true;
    node.disabled = false;
  }
}

function syncNodeSelection(view, sel) {
  if (sel instanceof prosemirrorState.NodeSelection) {
    var desc = view.docView.descAt(sel.from);
    if (desc != view.lastSelectedViewDesc) {
      clearNodeSelection(view);
      if (desc) { desc.selectNode(); }
      view.lastSelectedViewDesc = desc;
    }
  } else {
    clearNodeSelection(view);
  }
}

// Clear all DOM statefulness of the last node selection.
function clearNodeSelection(view) {
  if (view.lastSelectedViewDesc) {
    if (view.lastSelectedViewDesc.parent)
      { view.lastSelectedViewDesc.deselectNode(); }
    view.lastSelectedViewDesc = null;
  }
}

function selectionBetween(view, $anchor, $head, bias) {
  return view.someProp("createSelectionBetween", function (f) { return f(view, $anchor, $head); })
    || prosemirrorState.TextSelection.between($anchor, $head, bias)
}

function hasFocusAndSelection(view) {
  if (view.editable && view.root.activeElement != view.dom) { return false }
  return hasSelection(view)
}

function hasSelection(view) {
  var sel = view.root.getSelection();
  if (!sel.anchorNode) { return false }
  try {
    // Firefox will raise 'permission denied' errors when accessing
    // properties of `sel.anchorNode` when it's in a generated CSS
    // element.
    return view.dom.contains(sel.anchorNode.nodeType == 3 ? sel.anchorNode.parentNode : sel.anchorNode) &&
      (view.editable || view.dom.contains(sel.focusNode.nodeType == 3 ? sel.focusNode.parentNode : sel.focusNode))
  } catch(_) {
    return false
  }
}

function nonInclusiveMark(mark) {
  return mark.type.spec.inclusive === false
}

function needsCursorWrapper(state) {
  var ref = state.selection;
  var $head = ref.$head;
  var $anchor = ref.$anchor;
  var visible = ref.visible;
  var $pos = $head.pos == $anchor.pos && (!visible || $head.parent.inlineContent) ? $head : null;
  if ($pos && (!visible || state.storedMarks || $pos.parent.content.length == 0 ||
               $pos.parentOffset && !$pos.textOffset && $pos.nodeBefore.marks.some(nonInclusiveMark)))
    { return $pos }
  else
    { return null }
}

function anchorInRightPlace(view) {
  var anchorDOM = view.docView.domFromPos(view.state.selection.anchor);
  var domSel = view.root.getSelection();
  return isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset)
}

// Note that all referencing and parsing is done with the
// start-of-operation selection and document, since that's the one
// that the DOM represents. If any changes came in in the meantime,
// the modification is mapped over those before it is applied, in
// readDOMChange.

function parseBetween(view, from_, to_) {
  var ref = view.docView.parseRange(from_, to_);
  var parent = ref.node;
  var fromOffset = ref.fromOffset;
  var toOffset = ref.toOffset;
  var from = ref.from;
  var to = ref.to;

  var domSel = view.root.getSelection(), find = null, anchor = domSel.anchorNode;
  if (anchor && view.dom.contains(anchor.nodeType == 1 ? anchor : anchor.parentNode)) {
    find = [{node: anchor, offset: domSel.anchorOffset}];
    if (!selectionCollapsed(domSel))
      { find.push({node: domSel.focusNode, offset: domSel.focusOffset}); }
  }
  // Work around issue in Chrome where backspacing sometimes replaces
  // the deleted content with a random BR node (issues #799, #831)
  if (result.chrome && view.lastKeyCode === 8) {
    for (var off = toOffset; off > fromOffset; off--) {
      var node = parent.childNodes[off - 1], desc = node.pmViewDesc;
      if (node.nodeType == "BR" && !desc) { toOffset = off; break }
      if (!desc || desc.size) { break }
    }
  }
  var startDoc = view.state.doc;
  var parser = view.someProp("domParser") || prosemirrorModel.DOMParser.fromSchema(view.state.schema);
  var $from = startDoc.resolve(from);
  var sel = null, doc = parser.parse(parent, {
    topNode: $from.parent,
    topMatch: $from.parent.contentMatchAt($from.index()),
    topOpen: true,
    from: fromOffset,
    to: toOffset,
    preserveWhitespace: $from.parent.type.spec.code ? "full" : true,
    editableContent: true,
    findPositions: find,
    ruleFromNode: ruleFromNode(parser, $from),
    context: $from
  });
  if (find && find[0].pos != null) {
    var anchor$1 = find[0].pos, head = find[1] && find[1].pos;
    if (head == null) { head = anchor$1; }
    sel = {anchor: anchor$1 + from, head: head + from};
  }
  return {doc: doc, sel: sel, from: from, to: to}
}

function ruleFromNode(parser, context) {
  return function (dom) {
    var desc = dom.pmViewDesc;
    if (desc) {
      return desc.parseRule()
    } else if (dom.nodeName == "BR" && dom.parentNode) {
      // Safari replaces the list item or table cell with a BR
      // directly in the list node (?!) if you delete the last
      // character in a list item or table cell (#708, #862)
      if (result.safari && /^(ul|ol)$/i.test(dom.parentNode.nodeName))
        { return parser.matchTag(document.createElement("li"), context) }
      else if (dom.parentNode.lastChild == dom || result.safari && /^(tr|table)$/i.test(dom.parentNode.nodeName))
        { return {ignore: true} }
    }
  }
}

function readDOMChange(view, from, to, typeOver) {
  if (from < 0) {
    var origin = view.lastSelectionTime > Date.now() - 50 ? view.lastSelectionOrigin : null;
    var newSel = selectionFromDOM(view, origin);
    if (!view.state.selection.eq(newSel)) {
      var tr$1 = view.state.tr.setSelection(newSel);
      if (origin == "pointer") { tr$1.setMeta("pointer", true); }
      else if (origin == "key") { tr$1.scrollIntoView(); }
      view.dispatch(tr$1);
    }
    return
  }

  var $before = view.state.doc.resolve(from);
  var shared = $before.sharedDepth(to);
  from = $before.before(shared + 1);
  to = view.state.doc.resolve(to).after(shared + 1);

  var sel = view.state.selection;
  var parse = parseBetween(view, from, to);

  var doc = view.state.doc, compare = doc.slice(parse.from, parse.to);
  var preferredPos, preferredSide;
  // Prefer anchoring to end when Backspace is pressed
  if (view.lastKeyCode === 8 && Date.now() - 100 < view.lastKeyCodeTime) {
    preferredPos = view.state.selection.to;
    preferredSide = "end";
  } else {
    preferredPos = view.state.selection.from;
    preferredSide = "start";
  }
  view.lastKeyCode = null;

  var change = findDiff(compare.content, parse.doc.content, parse.from, preferredPos, preferredSide);
  if (!change) {
    if (typeOver && sel instanceof prosemirrorState.TextSelection && !sel.empty && sel.$head.sameParent(sel.$anchor) &&
        !view.composing && !(parse.sel && parse.sel.anchor != parse.sel.head)) {
      var state = view.state, sel$1 = state.selection;
      view.dispatch(state.tr.replaceSelectionWith(state.schema.text(state.doc.textBetween(sel$1.from, sel$1.to)), true).scrollIntoView());
    } else if (parse.sel) {
      var sel$2 = resolveSelection(view, view.state.doc, parse.sel);
      if (sel$2 && !sel$2.eq(view.state.selection)) { view.dispatch(view.state.tr.setSelection(sel$2)); }
    }
    return
  }
  view.domChangeCount++;
  // Handle the case where overwriting a selection by typing matches
  // the start or end of the selected content, creating a change
  // that's smaller than what was actually overwritten.
  if (view.state.selection.from < view.state.selection.to &&
      change.start == change.endB &&
      view.state.selection instanceof prosemirrorState.TextSelection) {
    if (change.start > view.state.selection.from && change.start <= view.state.selection.from + 2) {
      change.start = view.state.selection.from;
    } else if (change.endA < view.state.selection.to && change.endA >= view.state.selection.to - 2) {
      change.endB += (view.state.selection.to - change.endA);
      change.endA = view.state.selection.to;
    }
  }

  var $from = parse.doc.resolveNoCache(change.start - parse.from);
  var $to = parse.doc.resolveNoCache(change.endB - parse.from);
  var nextSel;
  // If this looks like the effect of pressing Enter, just dispatch an
  // Enter key instead.
  if (!$from.sameParent($to) && $from.pos < parse.doc.content.size &&
      (nextSel = prosemirrorState.Selection.findFrom(parse.doc.resolve($from.pos + 1), 1, true)) &&
      nextSel.head == $to.pos &&
      view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(13, "Enter")); }))
    { return }
  // Same for backspace
  if (view.state.selection.anchor > change.start &&
      looksLikeJoin(doc, change.start, change.endA, $from, $to) &&
      view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(8, "Backspace")); })) {
    if (result.android && result.chrome) { view.domObserver.suppressSelectionUpdates(); } // #820
    return
  }

  var chFrom = change.start, chTo = change.endA;

  var tr, storedMarks, markChange, $from1;
  if ($from.sameParent($to) && $from.parent.inlineContent) {
    if ($from.pos == $to.pos) { // Deletion
      // IE11 sometimes weirdly moves the DOM selection around after
      // backspacing out the first element in a textblock
      if (result.ie && result.ie_version <= 11 && $from.parentOffset == 0) {
        view.domObserver.suppressSelectionUpdates();
        setTimeout(function () { return selectionToDOM(view); }, 20);
      }
      tr = view.state.tr.delete(chFrom, chTo);
      storedMarks = doc.resolve(change.start).marksAcross(doc.resolve(change.endA));
    } else if ( // Adding or removing a mark
      change.endA == change.endB && ($from1 = doc.resolve(change.start)) &&
      (markChange = isMarkChange($from.parent.content.cut($from.parentOffset, $to.parentOffset),
                                 $from1.parent.content.cut($from1.parentOffset, change.endA - $from1.start())))
    ) {
      tr = view.state.tr;
      if (markChange.type == "add") { tr.addMark(chFrom, chTo, markChange.mark); }
      else { tr.removeMark(chFrom, chTo, markChange.mark); }
    } else if ($from.parent.child($from.index()).isText && $from.index() == $to.index() - ($to.textOffset ? 0 : 1)) {
      // Both positions in the same text node -- simply insert text
      var text = $from.parent.textBetween($from.parentOffset, $to.parentOffset);
      if (view.someProp("handleTextInput", function (f) { return f(view, chFrom, chTo, text); })) { return }
      tr = view.state.tr.insertText(text, chFrom, chTo);
    }
  }

  if (!tr)
    { tr = view.state.tr.replace(chFrom, chTo, parse.doc.slice(change.start - parse.from, change.endB - parse.from)); }
  if (parse.sel) {
    var sel$3 = resolveSelection(view, tr.doc, parse.sel);
    if (sel$3) { tr.setSelection(sel$3); }
  }
  if (storedMarks) { tr.ensureMarks(storedMarks); }
  view.dispatch(tr.scrollIntoView());
}

function resolveSelection(view, doc, parsedSel) {
  if (Math.max(parsedSel.anchor, parsedSel.head) > doc.content.size) { return null }
  return selectionBetween(view, doc.resolve(parsedSel.anchor), doc.resolve(parsedSel.head))
}

// : (Fragment, Fragment) → ?{mark: Mark, type: string}
// Given two same-length, non-empty fragments of inline content,
// determine whether the first could be created from the second by
// removing or adding a single mark type.
function isMarkChange(cur, prev) {
  var curMarks = cur.firstChild.marks, prevMarks = prev.firstChild.marks;
  var added = curMarks, removed = prevMarks, type, mark, update;
  for (var i = 0; i < prevMarks.length; i++) { added = prevMarks[i].removeFromSet(added); }
  for (var i$1 = 0; i$1 < curMarks.length; i$1++) { removed = curMarks[i$1].removeFromSet(removed); }
  if (added.length == 1 && removed.length == 0) {
    mark = added[0];
    type = "add";
    update = function (node) { return node.mark(mark.addToSet(node.marks)); };
  } else if (added.length == 0 && removed.length == 1) {
    mark = removed[0];
    type = "remove";
    update = function (node) { return node.mark(mark.removeFromSet(node.marks)); };
  } else {
    return null
  }
  var updated = [];
  for (var i$2 = 0; i$2 < prev.childCount; i$2++) { updated.push(update(prev.child(i$2))); }
  if (prosemirrorModel.Fragment.from(updated).eq(cur)) { return {mark: mark, type: type} }
}

function looksLikeJoin(old, start, end, $newStart, $newEnd) {
  if (!$newStart.parent.isTextblock ||
      // The content must have shrunk
      end - start <= $newEnd.pos - $newStart.pos ||
      // newEnd must point directly at or after the end of the block that newStart points into
      skipClosingAndOpening($newStart, true, false) < $newEnd.pos)
    { return false }

  var $start = old.resolve(start);
  // Start must be at the end of a block
  if ($start.parentOffset < $start.parent.content.size || !$start.parent.isTextblock)
    { return false }
  var $next = old.resolve(skipClosingAndOpening($start, true, true));
  // The next textblock must start before end and end near it
  if (!$next.parent.isTextblock || $next.pos > end ||
      skipClosingAndOpening($next, true, false) < end)
    { return false }

  // The fragments after the join point must match
  return $newStart.parent.content.cut($newStart.parentOffset).eq($next.parent.content)
}

function skipClosingAndOpening($pos, fromEnd, mayOpen) {
  var depth = $pos.depth, end = fromEnd ? $pos.end() : $pos.pos;
  while (depth > 0 && (fromEnd || $pos.indexAfter(depth) == $pos.node(depth).childCount)) {
    depth--;
    end++;
    fromEnd = false;
  }
  if (mayOpen) {
    var next = $pos.node(depth).maybeChild($pos.indexAfter(depth));
    while (next && !next.isLeaf) {
      next = next.firstChild;
      end++;
    }
  }
  return end
}

function findDiff(a, b, pos, preferredPos, preferredSide) {
  var start = a.findDiffStart(b, pos);
  if (start == null) { return null }
  var ref = a.findDiffEnd(b, pos + a.size, pos + b.size);
  var endA = ref.a;
  var endB = ref.b;
  if (preferredSide == "end") {
    var adjust = Math.max(0, start - Math.min(endA, endB));
    preferredPos -= endA + adjust - start;
  }
  if (endA < start && a.size < b.size) {
    var move = preferredPos <= start && preferredPos >= endA ? start - preferredPos : 0;
    start -= move;
    endB = start + (endB - endA);
    endA = start;
  } else if (endB < start) {
    var move$1 = preferredPos <= start && preferredPos >= endB ? start - preferredPos : 0;
    start -= move$1;
    endA = start + (endA - endB);
    endB = start;
  }
  return {start: start, endA: endA, endB: endB}
}

function serializeForClipboard(view, slice) {
  var context = [];
  var content = slice.content;
  var openStart = slice.openStart;
  var openEnd = slice.openEnd;
  while (openStart > 1 && openEnd > 1 && content.childCount == 1 && content.firstChild.childCount == 1) {
    openStart--;
    openEnd--;
    var node = content.firstChild;
    context.push(node.type.name, node.type.hasRequiredAttrs() ? node.attrs : null);
    content = node.content;
  }

  var serializer = view.someProp("clipboardSerializer") || prosemirrorModel.DOMSerializer.fromSchema(view.state.schema);
  var wrap = document.createElement("div");
  wrap.appendChild(serializer.serializeFragment(content));

  var firstChild = wrap.firstChild, needsWrap;
  while (firstChild && firstChild.nodeType == 1 && (needsWrap = wrapMap[firstChild.nodeName.toLowerCase()])) {
    for (var i = needsWrap.length - 1; i >= 0; i--) {
      var wrapper = document.createElement(needsWrap[i]);
      while (wrap.firstChild) { wrapper.appendChild(wrap.firstChild); }
      wrap.appendChild(wrapper);
    }
    firstChild = wrap.firstChild;
  }

  if (firstChild && firstChild.nodeType == 1)
    { firstChild.setAttribute("data-pm-slice", (openStart + " " + openEnd + " " + (JSON.stringify(context)))); }

  var text = view.someProp("clipboardTextSerializer", function (f) { return f(slice); }) ||
      slice.content.textBetween(0, slice.content.size, "\n\n");

  return {dom: wrap, text: text}
}

// : (EditorView, string, string, ?bool, ResolvedPos) → ?Slice
// Read a slice of content from the clipboard (or drop data).
function parseFromClipboard(view, text, html, plainText, $context) {
  var dom, inCode = $context.parent.type.spec.code, slice;
  if (!html && !text) { return null }
  var asText = text && (plainText || inCode || !html);
  if (asText) {
    view.someProp("transformPastedText", function (f) { text = f(text); });
    if (inCode) { return new prosemirrorModel.Slice(prosemirrorModel.Fragment.from(view.state.schema.text(text)), 0, 0) }
    var parsed = view.someProp("clipboardTextParser", function (f) { return f(text, $context); });
    if (parsed) {
      slice = parsed;
    } else {
      dom = document.createElement("div");
      text.trim().split(/(?:\r\n?|\n)+/).forEach(function (block) {
        dom.appendChild(document.createElement("p")).textContent = block;
      });
    }
  } else {
    view.someProp("transformPastedHTML", function (f) { html = f(html); });
    dom = readHTML(html);
  }

  var contextNode = dom && dom.querySelector("[data-pm-slice]");
  var sliceData = contextNode && /^(\d+) (\d+) (.*)/.exec(contextNode.getAttribute("data-pm-slice"));
  if (!slice) {
    var parser = view.someProp("clipboardParser") || view.someProp("domParser") || prosemirrorModel.DOMParser.fromSchema(view.state.schema);
    slice = parser.parseSlice(dom, {preserveWhitespace: !!(asText || sliceData), context: $context});
  }
  if (sliceData)
    { slice = addContext(new prosemirrorModel.Slice(slice.content, Math.min(slice.openStart, +sliceData[1]),
                                 Math.min(slice.openEnd, +sliceData[2])), sliceData[3]); }
  else // HTML wasn't created by ProseMirror. Make sure top-level siblings are coherent
    { slice = prosemirrorModel.Slice.maxOpen(normalizeSiblings(slice.content, $context), false); }
  view.someProp("transformPasted", function (f) { slice = f(slice); });
  return slice
}

// Takes a slice parsed with parseSlice, which means there hasn't been
// any content-expression checking done on the top nodes, tries to
// find a parent node in the current context that might fit the nodes,
// and if successful, rebuilds the slice so that it fits into that parent.
//
// This addresses the problem that Transform.replace expects a
// coherent slice, and will fail to place a set of siblings that don't
// fit anywhere in the schema.
function normalizeSiblings(fragment, $context) {
  if (fragment.childCount < 2) { return fragment }
  var loop = function ( d ) {
    var parent = $context.node(d);
    var match = parent.contentMatchAt($context.index(d));
    var lastWrap = (void 0), result = [];
    fragment.forEach(function (node) {
      if (!result) { return }
      var wrap = match.findWrapping(node.type), inLast;
      if (!wrap) { return result = null }
      if (inLast = result.length && lastWrap.length && addToSibling(wrap, lastWrap, node, result[result.length - 1], 0)) {
        result[result.length - 1] = inLast;
      } else {
        if (result.length) { result[result.length - 1] = closeRight(result[result.length - 1], lastWrap.length); }
        var wrapped = withWrappers(node, wrap);
        result.push(wrapped);
        match = match.matchType(wrapped.type, wrapped.attrs);
        lastWrap = wrap;
      }
    });
    if (result) { return { v: prosemirrorModel.Fragment.from(result) } }
  };

  for (var d = $context.depth; d >= 0; d--) {
    var returned = loop( d );

    if ( returned ) return returned.v;
  }
  return fragment
}

function withWrappers(node, wrap, from) {
  if ( from === void 0 ) from = 0;

  for (var i = wrap.length - 1; i >= from; i--)
    { node = wrap[i].create(null, prosemirrorModel.Fragment.from(node)); }
  return node
}

// Used to group adjacent nodes wrapped in similar parents by
// normalizeSiblings into the same parent node
function addToSibling(wrap, lastWrap, node, sibling, depth) {
  if (depth < wrap.length && depth < lastWrap.length && wrap[depth] == lastWrap[depth]) {
    var inner = addToSibling(wrap, lastWrap, node, sibling.lastChild, depth + 1);
    if (inner) { return sibling.copy(sibling.content.replaceChild(sibling.childCount - 1, inner)) }
    var match = sibling.contentMatchAt(sibling.childCount);
    if (match.matchType(depth == wrap.length - 1 ? node.type : wrap[depth + 1]))
      { return sibling.copy(sibling.content.append(prosemirrorModel.Fragment.from(withWrappers(node, wrap, depth + 1)))) }
  }
}

function closeRight(node, depth) {
  if (depth == 0) { return node }
  var fragment = node.content.replaceChild(node.childCount - 1, closeRight(node.lastChild, depth - 1));
  var fill = node.contentMatchAt(node.childCount).fillBefore(prosemirrorModel.Fragment.empty, true);
  return node.copy(fragment.append(fill))
}

// Trick from jQuery -- some elements must be wrapped in other
// elements for innerHTML to work. I.e. if you do `div.innerHTML =
// "<td>..</td>"` the table cells are ignored.
var wrapMap = {thead: ["table"], colgroup: ["table"], col: ["table", "colgroup"],
                 tr: ["table", "tbody"], td: ["table", "tbody", "tr"], th: ["table", "tbody", "tr"]};
var detachedDoc = null;
function readHTML(html) {
  var metas = /(\s*<meta [^>]*>)*/.exec(html);
  if (metas) { html = html.slice(metas[0].length); }
  var doc = detachedDoc || (detachedDoc = document.implementation.createHTMLDocument("title"));
  var elt = doc.createElement("div");
  var firstTag = /(?:<meta [^>]*>)*<([a-z][^>\s]+)/i.exec(html), wrap, depth = 0;
  if (wrap = firstTag && wrapMap[firstTag[1].toLowerCase()]) {
    html = wrap.map(function (n) { return "<" + n + ">"; }).join("") + html + wrap.map(function (n) { return "</" + n + ">"; }).reverse().join("");
    depth = wrap.length;
  }
  elt.innerHTML = html;
  for (var i = 0; i < depth; i++) { elt = elt.firstChild; }
  return elt
}

function addContext(slice, context) {
  if (!slice.size) { return slice }
  var schema = slice.content.firstChild.type.schema, array;
  try { array = JSON.parse(context); }
  catch(e) { return slice }
  var content = slice.content;
  var openStart = slice.openStart;
  var openEnd = slice.openEnd;
  for (var i = array.length - 2; i >= 0; i -= 2) {
    var type = schema.nodes[array[i]];
    if (!type || type.hasRequiredAttrs()) { break }
    content = prosemirrorModel.Fragment.from(type.create(array[i + 1], content));
    openStart++; openEnd++;
  }
  return new prosemirrorModel.Slice(content, openStart, openEnd)
}

var observeOptions = {childList: true, characterData: true, attributes: true, subtree: true, characterDataOldValue: true};
// IE11 has very broken mutation observers, so we also listen to DOMCharacterDataModified
var useCharData = result.ie && result.ie_version <= 11;

var SelectionState = function SelectionState() {
  this.anchorNode = this.anchorOffset = this.focusNode = this.focusOffset = null;
};

SelectionState.prototype.set = function set (sel) {
  this.anchorNode = sel.anchorNode; this.anchorOffset = sel.anchorOffset;
  this.focusNode = sel.focusNode; this.focusOffset = sel.focusOffset;
};

SelectionState.prototype.eq = function eq (sel) {
  return sel.anchorNode == this.anchorNode && sel.anchorOffset == this.anchorOffset &&
    sel.focusNode == this.focusNode && sel.focusOffset == this.focusOffset
};

var DOMObserver = function DOMObserver(view, handleDOMChange) {
  var this$1 = this;

  this.view = view;
  this.handleDOMChange = handleDOMChange;
  this.observer = window.MutationObserver &&
    new window.MutationObserver(function (mutations) { return this$1.flush(mutations); });
  this.currentSelection = new SelectionState;
  this.queue = [];
  if (useCharData) {
    this.onCharData = function (e) {
      this$1.queue.push({target: e.target, type: "characterData", oldValue: e.prevValue});
      window.setTimeout(function () { return this$1.flush(); }, 20);
    };
  }
  this.onSelectionChange = this.onSelectionChange.bind(this);
  this.suppressingSelectionUpdates = false;
};

DOMObserver.prototype.start = function start () {
  if (this.observer)
    { this.observer.observe(this.view.dom, observeOptions); }
  if (useCharData)
    { this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData); }
  this.connectSelection();
};

DOMObserver.prototype.stop = function stop () {
    var this$1 = this;

  var take = this.observer.takeRecords();
  if (take.length) {
    for (var i = 0; i < take.length; i++) { this$1.queue.push(take[i]); }
    window.setTimeout(function () { return this$1.flush(); }, 20);
  }
  if (this.observer) { this.observer.disconnect(); }
  if (useCharData) { this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData); }
  this.disconnectSelection();
};

DOMObserver.prototype.connectSelection = function connectSelection () {
  this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
};

DOMObserver.prototype.disconnectSelection = function disconnectSelection () {
  this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
};

DOMObserver.prototype.suppressSelectionUpdates = function suppressSelectionUpdates () {
    var this$1 = this;

  this.suppressingSelectionUpdates = true;
  setTimeout(function () { return this$1.suppressingSelectionUpdates = false; }, 50);
};

DOMObserver.prototype.onSelectionChange = function onSelectionChange () {
  if (!hasFocusAndSelection(this.view)) { return }
  if (this.suppressingSelectionUpdates) { return selectionToDOM(this.view) }
  this.flush();
};

DOMObserver.prototype.setCurSelection = function setCurSelection () {
  this.currentSelection.set(this.view.root.getSelection());
};

DOMObserver.prototype.flush = function flush (mutations) {
    var this$1 = this;

  if (!this.view.docView) { return }
  if (!mutations) { mutations = this.observer.takeRecords(); }
  if (this.queue.length) {
    mutations = this.queue.concat(mutations);
    this.queue.length = 0;
  }

  var sel = this.view.root.getSelection();
  var newSel = !this.suppressingSelectionUpdates && !this.currentSelection.eq(sel) && hasSelection(this.view);

  var from = -1, to = -1, typeOver = false;
  if (this.view.editable) {
    for (var i = 0; i < mutations.length; i++) {
      var result$$1 = this$1.registerMutation(mutations[i]);
      if (result$$1) {
        from = from < 0 ? result$$1.from : Math.min(result$$1.from, from);
        to = to < 0 ? result$$1.to : Math.max(result$$1.to, to);
        if (result$$1.typeOver) { typeOver = true; }
      }
    }
  }
  if (from > -1 || newSel) {
    if (from > -1) { this.view.docView.markDirty(from, to); }
    this.handleDOMChange(from, to, typeOver);
    if (this.view.docView.dirty) { this.view.updateState(this.view.state); }
    else if (!this.currentSelection.eq(sel)) { selectionToDOM(this.view); }
  }
};

DOMObserver.prototype.registerMutation = function registerMutation (mut) {
  var desc = this.view.docView.nearestDesc(mut.target);
  if (mut.type == "attributes" &&
      (desc == this.view.docView || mut.attributeName == "contenteditable")) { return null }
  if (!desc || desc.ignoreMutation(mut)) { return null }

  if (mut.type == "childList") {
    var fromOffset = mut.previousSibling && mut.previousSibling.parentNode == mut.target
        ? domIndex(mut.previousSibling) + 1 : 0;
    var from = desc.localPosFromDOM(mut.target, fromOffset, -1);
    var toOffset = mut.nextSibling && mut.nextSibling.parentNode == mut.target
        ? domIndex(mut.nextSibling) : mut.target.childNodes.length;
    var to = desc.localPosFromDOM(mut.target, toOffset, 1);
    return {from: from, to: to}
  } else if (mut.type == "attributes") {
    return {from: desc.posAtStart - desc.border, to: desc.posAtEnd + desc.border}
  } else { // "characterData"
    return {
      from: desc.posAtStart,
      to: desc.posAtEnd,
      // An event was generated for a text change that didn't change
      // any text. Mark the dom change to fall back to assuming the
      // selection was typed over with an identical value if it can't
      // find another change.
      typeOver: mut.target.nodeValue == mut.oldValue
    }
  }
};

// A collection of DOM events that occur within the editor, and callback functions
// to invoke when the event fires.
var handlers = {};
var editHandlers = {};

function initInput(view) {
  view.shiftKey = false;
  view.mouseDown = null;
  view.lastKeyCode = null;
  view.lastKeyCodeTime = 0;
  view.lastClick = {time: 0, x: 0, y: 0, type: ""};
  view.lastSelectionOrigin = null;
  view.lastSelectionTime = 0;

  view.composing = false;
  view.composingTimeout = null;
  view.compositionNodes = [];
  view.compositionEndedAt = -2e8;

  view.domObserver = new DOMObserver(view, function (from, to, typeOver) { return readDOMChange(view, from, to, typeOver); });
  view.domObserver.start();
  // Used by hacks like the beforeinput handler to check whether anything happened in the DOM
  view.domChangeCount = 0;

  view.eventHandlers = Object.create(null);
  var loop = function ( event ) {
    var handler = handlers[event];
    view.dom.addEventListener(event, view.eventHandlers[event] = function (event) {
      if (eventBelongsToView(view, event) && !runCustomHandler(view, event) &&
          (view.editable || !(event.type in editHandlers)))
        { handler(view, event); }
    });
  };

  for (var event in handlers) loop( event );
  // On Safari, for reasons beyond my understanding, adding an input
  // event handler makes an issue where the composition vanishes when
  // you press enter go away.
  if (result.safari) { view.dom.addEventListener("input", function () { return null; }); }

  ensureListeners(view);
}

function setSelectionOrigin(view, origin) {
  view.lastSelectionOrigin = origin;
  view.lastSelectionTime = Date.now();
}

function destroyInput(view) {
  view.domObserver.stop();
  for (var type in view.eventHandlers)
    { view.dom.removeEventListener(type, view.eventHandlers[type]); }
  clearTimeout(view.composingTimeout);
}

function ensureListeners(view) {
  view.someProp("handleDOMEvents", function (currentHandlers) {
    for (var type in currentHandlers) { if (!view.eventHandlers[type])
      { view.dom.addEventListener(type, view.eventHandlers[type] = function (event) { return runCustomHandler(view, event); }); } }
  });
}

function runCustomHandler(view, event) {
  return view.someProp("handleDOMEvents", function (handlers) {
    var handler = handlers[event.type];
    return handler ? handler(view, event) || event.defaultPrevented : false
  })
}

function eventBelongsToView(view, event) {
  if (!event.bubbles) { return true }
  if (event.defaultPrevented) { return false }
  for (var node = event.target; node != view.dom; node = node.parentNode)
    { if (!node || node.nodeType == 11 ||
        (node.pmViewDesc && node.pmViewDesc.stopEvent(event)))
      { return false } }
  return true
}

function dispatchEvent(view, event) {
  if (!runCustomHandler(view, event) && handlers[event.type] &&
      (view.editable || !(event.type in editHandlers)))
    { handlers[event.type](view, event); }
}

editHandlers.keydown = function (view, event) {
  view.shiftKey = event.keyCode == 16 || event.shiftKey;
  if (inOrNearComposition(view, event)) { return }
  view.lastKeyCode = event.keyCode;
  view.lastKeyCodeTime = Date.now();
  if (view.someProp("handleKeyDown", function (f) { return f(view, event); }) || captureKeyDown(view, event))
    { event.preventDefault(); }
  else
    { setSelectionOrigin(view, "key"); }
};

editHandlers.keyup = function (view, e) {
  if (e.keyCode == 16) { view.shiftKey = false; }
};

editHandlers.keypress = function (view, event) {
  if (inOrNearComposition(view, event) || !event.charCode ||
      event.ctrlKey && !event.altKey || result.mac && event.metaKey) { return }

  if (view.someProp("handleKeyPress", function (f) { return f(view, event); })) {
    event.preventDefault();
    return
  }

  var sel = view.state.selection;
  if (!(sel instanceof prosemirrorState.TextSelection) || !sel.$from.sameParent(sel.$to)) {
    var text = String.fromCharCode(event.charCode);
    if (!view.someProp("handleTextInput", function (f) { return f(view, sel.$from.pos, sel.$to.pos, text); }))
      { view.dispatch(view.state.tr.insertText(text).scrollIntoView()); }
    event.preventDefault();
  }
};

function eventCoords(event) { return {left: event.clientX, top: event.clientY} }

function isNear(event, click) {
  var dx = click.x - event.clientX, dy = click.y - event.clientY;
  return dx * dx + dy * dy < 100
}

function runHandlerOnContext(view, propName, pos, inside, event) {
  if (inside == -1) { return false }
  var $pos = view.state.doc.resolve(inside);
  var loop = function ( i ) {
    if (view.someProp(propName, function (f) { return i > $pos.depth ? f(view, pos, $pos.nodeAfter, $pos.before(i), event, true)
                                                    : f(view, pos, $pos.node(i), $pos.before(i), event, false); }))
      { return { v: true } }
  };

  for (var i = $pos.depth + 1; i > 0; i--) {
    var returned = loop( i );

    if ( returned ) return returned.v;
  }
  return false
}

function updateSelection(view, selection, origin) {
  if (!view.focused) { view.focus(); }
  var tr = view.state.tr.setSelection(selection);
  if (origin == "pointer") { tr.setMeta("pointer", true); }
  view.dispatch(tr);
}

function selectClickedLeaf(view, inside) {
  if (inside == -1) { return false }
  var $pos = view.state.doc.resolve(inside), node = $pos.nodeAfter;
  if (node && node.isAtom && prosemirrorState.NodeSelection.isSelectable(node)) {
    updateSelection(view, new prosemirrorState.NodeSelection($pos), "pointer");
    return true
  }
  return false
}

function selectClickedNode(view, inside) {
  if (inside == -1) { return false }
  var sel = view.state.selection, selectedNode, selectAt;
  if (sel instanceof prosemirrorState.NodeSelection) { selectedNode = sel.node; }

  var $pos = view.state.doc.resolve(inside);
  for (var i = $pos.depth + 1; i > 0; i--) {
    var node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
    if (prosemirrorState.NodeSelection.isSelectable(node)) {
      if (selectedNode && sel.$from.depth > 0 &&
          i >= sel.$from.depth && $pos.before(sel.$from.depth + 1) == sel.$from.pos)
        { selectAt = $pos.before(sel.$from.depth); }
      else
        { selectAt = $pos.before(i); }
      break
    }
  }

  if (selectAt != null) {
    updateSelection(view, prosemirrorState.NodeSelection.create(view.state.doc, selectAt), "pointer");
    return true
  } else {
    return false
  }
}

function handleSingleClick(view, pos, inside, event, selectNode) {
  return runHandlerOnContext(view, "handleClickOn", pos, inside, event) ||
    view.someProp("handleClick", function (f) { return f(view, pos, event); }) ||
    (selectNode ? selectClickedNode(view, inside) : selectClickedLeaf(view, inside))
}

function handleDoubleClick(view, pos, inside, event) {
  return runHandlerOnContext(view, "handleDoubleClickOn", pos, inside, event) ||
    view.someProp("handleDoubleClick", function (f) { return f(view, pos, event); })
}

function handleTripleClick(view, pos, inside, event) {
  return runHandlerOnContext(view, "handleTripleClickOn", pos, inside, event) ||
    view.someProp("handleTripleClick", function (f) { return f(view, pos, event); }) ||
    defaultTripleClick(view, inside)
}

function defaultTripleClick(view, inside) {
  var doc = view.state.doc;
  if (inside == -1) {
    if (doc.inlineContent) {
      updateSelection(view, prosemirrorState.TextSelection.create(doc, 0, doc.content.size), "pointer");
      return true
    }
    return false
  }

  var $pos = doc.resolve(inside);
  for (var i = $pos.depth + 1; i > 0; i--) {
    var node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
    var nodePos = $pos.before(i);
    if (node.inlineContent)
      { updateSelection(view, prosemirrorState.TextSelection.create(doc, nodePos + 1, nodePos + 1 + node.content.size), "pointer"); }
    else if (prosemirrorState.NodeSelection.isSelectable(node))
      { updateSelection(view, prosemirrorState.NodeSelection.create(doc, nodePos), "pointer"); }
    else
      { continue }
    return true
  }
}

function forceDOMFlush(view) {
  return endComposition(view)
}

var selectNodeModifier = result.mac ? "metaKey" : "ctrlKey";

handlers.mousedown = function (view, event) {
  view.shiftKey = event.shiftKey;
  var flushed = forceDOMFlush(view);
  var now = Date.now(), type = "singleClick";
  if (now - view.lastClick.time < 500 && isNear(event, view.lastClick) && !event[selectNodeModifier]) {
    if (view.lastClick.type == "singleClick") { type = "doubleClick"; }
    else if (view.lastClick.type == "doubleClick") { type = "tripleClick"; }
  }
  view.lastClick = {time: now, x: event.clientX, y: event.clientY, type: type};

  var pos = view.posAtCoords(eventCoords(event));
  if (!pos) { return }

  if (type == "singleClick")
    { view.mouseDown = new MouseDown(view, pos, event, flushed); }
  else if ((type == "doubleClick" ? handleDoubleClick : handleTripleClick)(view, pos.pos, pos.inside, event))
    { event.preventDefault(); }
  else
    { setSelectionOrigin(view, "pointer"); }
};

var MouseDown = function MouseDown(view, pos, event, flushed) {
  var this$1 = this;

  this.view = view;
  this.startDoc = view.state.doc;
  this.pos = pos;
  this.event = event;
  this.flushed = flushed;
  this.selectNode = event[selectNodeModifier];
  this.allowDefault = event.shiftKey;

  var targetNode, targetPos;
  if (pos.inside > -1) {
    targetNode = view.state.doc.nodeAt(pos.inside);
    targetPos = pos.inside;
  } else {
    var $pos = view.state.doc.resolve(pos.pos);
    targetNode = $pos.parent;
    targetPos = $pos.depth ? $pos.before() : 0;
  }

  this.mightDrag = null;

  var target = flushed ? null : event.target;
  var targetDesc = target ? view.docView.nearestDesc(target, true) : null;
  this.target = targetDesc ? targetDesc.dom : null;

  if (targetNode.type.spec.draggable && targetNode.type.spec.selectable !== false ||
      view.state.selection instanceof prosemirrorState.NodeSelection && targetPos == view.state.selection.from)
    { this.mightDrag = {node: targetNode,
                      pos: targetPos,
                      addAttr: this.target && !this.target.draggable,
                      setUneditable: this.target && result.gecko && !this.target.hasAttribute("contentEditable")}; }

  if (this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable)) {
    this.view.domObserver.stop();
    if (this.mightDrag.addAttr) { this.target.draggable = true; }
    if (this.mightDrag.setUneditable)
      { setTimeout(function () { return this$1.target.setAttribute("contentEditable", "false"); }, 20); }
    this.view.domObserver.start();
  }

  view.root.addEventListener("mouseup", this.up = this.up.bind(this));
  view.root.addEventListener("mousemove", this.move = this.move.bind(this));
  setSelectionOrigin(view, "pointer");
};

MouseDown.prototype.done = function done () {
  this.view.root.removeEventListener("mouseup", this.up);
  this.view.root.removeEventListener("mousemove", this.move);
  if (this.mightDrag && this.target) {
    this.view.domObserver.stop();
    if (this.mightDrag.addAttr) { this.target.draggable = false; }
    if (this.mightDrag.setUneditable) { this.target.removeAttribute("contentEditable"); }
    this.view.domObserver.start();
  }
  this.view.mouseDown = null;
};

MouseDown.prototype.up = function up (event) {
  this.done();

  if (!this.view.dom.contains(event.target.nodeType == 3 ? event.target.parentNode : event.target))
    { return }

  var pos = this.pos;
  if (this.view.state.doc != this.startDoc) { pos = this.view.posAtCoords(eventCoords(event)); }

  if (this.allowDefault || !pos) {
    // Force a cursor wrapper redraw if this was suppressed (to avoid an issue with IE drag-selection)
    if (result.ie && needsCursorWrapper(this.view.state)) { this.view.updateState(this.view.state); }
    setSelectionOrigin(this.view, "pointer");
  } else if (handleSingleClick(this.view, pos.pos, pos.inside, event, this.selectNode)) {
    event.preventDefault();
  } else if (this.flushed ||
             // Chrome will sometimes treat a node selection as a
             // cursor, but still report that the node is selected
             // when asked through getSelection. You'll then get a
             // situation where clicking at the point where that
             // (hidden) cursor is doesn't change the selection, and
             // thus doesn't get a reaction from ProseMirror. This
             // works around that.
             (result.chrome && !(this.view.state.selection instanceof prosemirrorState.TextSelection) &&
              (pos.pos == this.view.state.selection.from || pos.pos == this.view.state.selection.to))) {
    updateSelection(this.view, prosemirrorState.Selection.near(this.view.state.doc.resolve(pos.pos)), "pointer");
    event.preventDefault();
  } else {
    setSelectionOrigin(this.view, "pointer");
  }
};

MouseDown.prototype.move = function move (event) {
  if (!this.allowDefault && (Math.abs(this.event.x - event.clientX) > 4 ||
                             Math.abs(this.event.y - event.clientY) > 4))
    { this.allowDefault = true; }
  setSelectionOrigin(this.view, "pointer");
};

handlers.touchdown = function (view) {
  forceDOMFlush(view);
  setSelectionOrigin(view, "pointer");
};

handlers.contextmenu = function (view) { return forceDOMFlush(view); };

function inOrNearComposition(view, event) {
  if (view.composing) { return true }
  // See https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/.
  // On Japanese input method editors (IMEs), the Enter key is used to confirm character
  // selection. On Safari, when Enter is pressed, compositionend and keydown events are
  // emitted. The keydown event triggers newline insertion, which we don't want.
  // This method returns true if the keydown event should be ignored.
  // We only ignore it once, as pressing Enter a second time *should* insert a newline.
  // Furthermore, the keydown event timestamp must be close to the compositionEndedAt timestamp.
  // This guards against the case where compositionend is triggered without the keyboard
  // (e.g. character confirmation may be done with the mouse), and keydown is triggered
  // afterwards- we wouldn't want to ignore the keydown event in this case.
  if (result.safari && Math.abs(event.timeStamp - view.compositionEndedAt) < 500) {
    view.compositionEndedAt = -2e8;
    return true
  }
  return false
}

// Drop active composition after 5 seconds of inactivity on Android
var timeoutComposition = result.android ? 5000 : -1;

editHandlers.compositionstart = editHandlers.compositionupdate = function (view) {
  if (!view.composing) {
    view.domObserver.flush();
    endComposition(view);
    view.composing = true;
  }
  scheduleComposeEnd(view, timeoutComposition);
};

editHandlers.compositionend = function (view, event) {
  if (view.composing) {
    view.composing = false;
    view.compositionEndedAt = event.timeStamp;
    scheduleComposeEnd(view, 20);
  }
};

function scheduleComposeEnd(view, delay) {
  clearTimeout(view.composingTimeout);
  if (delay > -1) { view.composingTimeout = setTimeout(function () { return endComposition(view); }, delay); }
}

function endComposition(view) {
  view.composing = false;
  while (view.compositionNodes.length > 0) { view.compositionNodes.pop().markParentsDirty(); }
  if (view.docView.dirty) {
    view.updateState(view.state);
    return true
  }
  return false
}

function captureCopy(view, dom) {
  // The extra wrapper is somehow necessary on IE/Edge to prevent the
  // content from being mangled when it is put onto the clipboard
  var doc = dom.ownerDocument;
  var wrap = doc.body.appendChild(doc.createElement("div"));
  wrap.appendChild(dom);
  wrap.style.cssText = "position: fixed; left: -10000px; top: 10px";
  var sel = getSelection(), range = doc.createRange();
  range.selectNodeContents(dom);
  // Done because IE will fire a selectionchange moving the selection
  // to its start when removeAllRanges is called and the editor still
  // has focus (which will mess up the editor's selection state).
  view.dom.blur();
  sel.removeAllRanges();
  sel.addRange(range);
  setTimeout(function () {
    doc.body.removeChild(wrap);
    view.focus();
  }, 50);
}

// This is very crude, but unfortunately both these browsers _pretend_
// that they have a clipboard API—all the objects and methods are
// there, they just don't work, and they are hard to test.
var brokenClipboardAPI = (result.ie && result.ie_version < 15) ||
      (result.ios && result.webkit_version < 604);

handlers.copy = editHandlers.cut = function (view, e) {
  var sel = view.state.selection, cut = e.type == "cut";
  if (sel.empty) { return }

  // IE and Edge's clipboard interface is completely broken
  var data = brokenClipboardAPI ? null : e.clipboardData;
  var slice = sel.content();
  var ref = serializeForClipboard(view, slice);
  var dom = ref.dom;
  var text = ref.text;
  if (data) {
    e.preventDefault();
    data.clearData();
    data.setData("text/html", dom.innerHTML);
    data.setData("text/plain", text);
  } else {
    captureCopy(view, dom);
  }
  if (cut) { view.dispatch(view.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut")); }
};

function sliceSingleNode(slice) {
  return slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1 ? slice.content.firstChild : null
}

function capturePaste(view, e) {
  var doc = view.dom.ownerDocument;
  var plainText = view.shiftKey || view.state.selection.$from.parent.type.spec.code;
  var target = doc.body.appendChild(doc.createElement(plainText ? "textarea" : "div"));
  if (!plainText) { target.contentEditable = "true"; }
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.focus();
  setTimeout(function () {
    view.focus();
    doc.body.removeChild(target);
    if (plainText) { doPaste(view, target.value, null, e); }
    else { doPaste(view, target.textContent, target.innerHTML, e); }
  }, 50);
}

function doPaste(view, text, html, e) {
  var slice = parseFromClipboard(view, text, html, view.shiftKey, view.state.selection.$from);
  if (view.someProp("handlePaste", function (f) { return f(view, e, slice || prosemirrorModel.Slice.empty); }) || !slice) { return true }

  var singleNode = sliceSingleNode(slice);
  var tr = singleNode ? view.state.tr.replaceSelectionWith(singleNode, view.shiftKey) : view.state.tr.replaceSelection(slice);
  view.dispatch(tr.scrollIntoView().setMeta("paste", true).setMeta("uiEvent", "paste"));
  return true
}

editHandlers.paste = function (view, e) {
  var data = brokenClipboardAPI ? null : e.clipboardData;
  if (data && (doPaste(view, data.getData("text/plain"), data.getData("text/html"), e) || data.files.length > 0))
    { e.preventDefault(); }
  else
    { capturePaste(view, e); }
};

var Dragging = function Dragging(slice, move) {
  this.slice = slice;
  this.move = move;
};

var dragCopyModifier = result.mac ? "altKey" : "ctrlKey";

handlers.dragstart = function (view, e) {
  var mouseDown = view.mouseDown;
  if (mouseDown) { mouseDown.done(); }
  if (!e.dataTransfer) { return }

  var sel = view.state.selection;
  var pos = sel.empty ? null : view.posAtCoords(eventCoords(e));
  if (pos && pos.pos >= sel.from && pos.pos <= (sel instanceof prosemirrorState.NodeSelection ? sel.to - 1: sel.to)) {
    // In selection
  } else if (mouseDown && mouseDown.mightDrag) {
    view.dispatch(view.state.tr.setSelection(prosemirrorState.NodeSelection.create(view.state.doc, mouseDown.mightDrag.pos)));
  } else if (e.target && e.target.nodeType == 1) {
    var desc = view.docView.nearestDesc(e.target, true);
    if (!desc || !desc.node.type.spec.draggable || desc == view.docView) { return }
    view.dispatch(view.state.tr.setSelection(prosemirrorState.NodeSelection.create(view.state.doc, desc.posBefore)));
  }
  var slice = view.state.selection.content();
  var ref = serializeForClipboard(view, slice);
  var dom = ref.dom;
  var text = ref.text;
  e.dataTransfer.clearData();
  e.dataTransfer.setData(brokenClipboardAPI ? "Text" : "text/html", dom.innerHTML);
  if (!brokenClipboardAPI) { e.dataTransfer.setData("text/plain", text); }
  view.dragging = new Dragging(slice, !e[dragCopyModifier]);
};

handlers.dragend = function (view) {
  window.setTimeout(function () { return view.dragging = null; }, 50);
};

editHandlers.dragover = editHandlers.dragenter = function (_, e) { return e.preventDefault(); };

editHandlers.drop = function (view, e) {
  var dragging = view.dragging;
  view.dragging = null;

  if (!e.dataTransfer) { return }

  var eventPos = view.posAtCoords(eventCoords(e));
  if (!eventPos) { return }
  var $mouse = view.state.doc.resolve(eventPos.pos);
  if (!$mouse) { return }
  var slice = dragging && dragging.slice ||
      parseFromClipboard(view, e.dataTransfer.getData(brokenClipboardAPI ? "Text" : "text/plain"),
                         brokenClipboardAPI ? null : e.dataTransfer.getData("text/html"), false, $mouse);
  if (!slice) { return }

  e.preventDefault();
  if (view.someProp("handleDrop", function (f) { return f(view, e, slice, dragging && dragging.move); })) { return }
  var insertPos = slice ? prosemirrorTransform.dropPoint(view.state.doc, $mouse.pos, slice) : $mouse.pos;
  if (insertPos == null) { insertPos = $mouse.pos; }

  var tr = view.state.tr;
  if (dragging && dragging.move) { tr.deleteSelection(); }

  var pos = tr.mapping.map(insertPos);
  var isNode = slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1;
  var beforeInsert = tr.doc;
  if (isNode)
    { tr.replaceRangeWith(pos, pos, slice.content.firstChild); }
  else
    { tr.replaceRange(pos, pos, slice); }
  if (tr.doc.eq(beforeInsert)) { return }

  var $pos = tr.doc.resolve(pos);
  if (isNode && prosemirrorState.NodeSelection.isSelectable(slice.content.firstChild) &&
      $pos.nodeAfter && $pos.nodeAfter.sameMarkup(slice.content.firstChild))
    { tr.setSelection(new prosemirrorState.NodeSelection($pos)); }
  else
    { tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(tr.mapping.map(insertPos)))); }
  view.focus();
  view.dispatch(tr.setMeta("uiEvent", "drop"));
};

handlers.focus = function (view) {
  if (!view.focused) {
    view.domObserver.stop();
    view.dom.classList.add("ProseMirror-focused");
    view.domObserver.start();
    view.focused = true;
  }
};

handlers.blur = function (view) {
  if (view.focused) {
    view.domObserver.stop();
    view.dom.classList.remove("ProseMirror-focused");
    view.domObserver.start();
    view.focused = false;
  }
};

handlers.beforeinput = function (view, event) {
  // We should probably do more with beforeinput events, but support
  // is so spotty that I'm still waiting to see where they are going.

  // Very specific hack to deal with backspace sometimes failing on
  // Chrome Android when after an uneditable node.
  if (result.chrome && result.android && event.inputType == "deleteContentBackward") {
    var domChangeCount = view.domChangeCount;
    setTimeout(function () {
      if (view.domChangeCount != domChangeCount) { return } // Event already had some effect
      // This bug tends to close the virtual keyboard, so we refocus
      view.dom.blur();
      view.focus();
      if (view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(8, "Backspace")); })) { return }
      var ref = view.state.selection;
      var $cursor = ref.$cursor;
      // Crude approximation of backspace behavior when no command handled it
      if ($cursor && $cursor.pos > 0) { view.dispatch(view.state.tr.delete($cursor.pos - 1, $cursor.pos).scrollIntoView()); }
    }, 50);
  }
};

// Make sure all handlers get registered
for (var prop in editHandlers) { handlers[prop] = editHandlers[prop]; }

function compareObjs(a, b) {
  if (a == b) { return true }
  for (var p in a) { if (a[p] !== b[p]) { return false } }
  for (var p$1 in b) { if (!(p$1 in a)) { return false } }
  return true
}

var WidgetType = function WidgetType(toDOM, spec) {
  this.spec = spec || noSpec;
  this.side = this.spec.side || 0;
  this.toDOM = toDOM;
};

WidgetType.prototype.map = function map (mapping, span, offset, oldOffset) {
  var ref = mapping.mapResult(span.from + oldOffset, this.side < 0 ? -1 : 1);
    var pos = ref.pos;
    var deleted = ref.deleted;
  return deleted ? null : new Decoration(pos - offset, pos - offset, this)
};

WidgetType.prototype.valid = function valid () { return true };

WidgetType.prototype.eq = function eq (other) {
  return this == other ||
    (other instanceof WidgetType &&
     (this.spec.key && this.spec.key == other.spec.key ||
      this.toDOM == other.toDOM && compareObjs(this.spec, other.spec)))
};

var InlineType = function InlineType(attrs, spec) {
  this.spec = spec || noSpec;
  this.attrs = attrs;
};

InlineType.prototype.map = function map (mapping, span, offset, oldOffset) {
  var from = mapping.map(span.from + oldOffset, this.spec.inclusiveStart ? -1 : 1) - offset;
  var to = mapping.map(span.to + oldOffset, this.spec.inclusiveEnd ? 1 : -1) - offset;
  return from >= to ? null : new Decoration(from, to, this)
};

InlineType.prototype.valid = function valid (_, span) { return span.from < span.to };

InlineType.prototype.eq = function eq (other) {
  return this == other ||
    (other instanceof InlineType && compareObjs(this.attrs, other.attrs) &&
     compareObjs(this.spec, other.spec))
};

InlineType.is = function is (span) { return span.type instanceof InlineType };

var NodeType = function NodeType(attrs, spec) {
  this.spec = spec || noSpec;
  this.attrs = attrs;
};

NodeType.prototype.map = function map (mapping, span, offset, oldOffset) {
  var from = mapping.mapResult(span.from + oldOffset, 1);
  if (from.deleted) { return null }
  var to = mapping.mapResult(span.to + oldOffset, -1);
  if (to.deleted || to.pos <= from.pos) { return null }
  return new Decoration(from.pos - offset, to.pos - offset, this)
};

NodeType.prototype.valid = function valid (node, span) {
  var ref = node.content.findIndex(span.from);
    var index = ref.index;
    var offset = ref.offset;
  return offset == span.from && offset + node.child(index).nodeSize == span.to
};

NodeType.prototype.eq = function eq (other) {
  return this == other ||
    (other instanceof NodeType && compareObjs(this.attrs, other.attrs) &&
     compareObjs(this.spec, other.spec))
};

// ::- Decoration objects can be provided to the view through the
// [`decorations` prop](#view.EditorProps.decorations). They come in
// several variants—see the static members of this class for details.
var Decoration = function Decoration(from, to, type) {
  // :: number
  // The start position of the decoration.
  this.from = from;
  // :: number
  // The end position. Will be the same as `from` for [widget
  // decorations](#view.Decoration^widget).
  this.to = to;
  this.type = type;
};

var prototypeAccessors$2 = { spec: {} };

Decoration.prototype.copy = function copy (from, to) {
  return new Decoration(from, to, this.type)
};

Decoration.prototype.eq = function eq (other) {
  return this.type.eq(other.type) && this.from == other.from && this.to == other.to
};

Decoration.prototype.map = function map (mapping, offset, oldOffset) {
  return this.type.map(mapping, this, offset, oldOffset)
};

// :: (number, union<(view: EditorView, getPos: () → number) → dom.Node, dom.Node>, ?Object) → Decoration
// Creates a widget decoration, which is a DOM node that's shown in
// the document at the given position. It is recommended that you
// delay rendering the widget by passing a function that will be
// called when the widget is actually drawn in a view, but you can
// also directly pass a DOM node. `getPos` can be used to find the
// widget's current document position.
//
// spec::- These options are supported:
//
//   side:: ?number
//   Controls which side of the document position this widget is
//   associated with. When negative, it is drawn before a cursor
//   at its position, and content inserted at that position ends
//   up after the widget. When zero (the default) or positive, the
//   widget is drawn after the cursor and content inserted there
//   ends up before the widget.
//
//   When there are multiple widgets at a given position, their
//   `side` values determine the order in which they appear. Those
//   with lower values appear first. The ordering of widgets with
//   the same `side` value is unspecified.
//
//   When `marks` is null, `side` also determines the marks that
//   the widget is wrapped in—those of the node before when
//   negative, those of the node after when positive.
//
//   marks:: ?[Mark]
//   The precise set of marks to draw around the widget.
//
//   stopEvent:: ?(event: dom.Event) → bool
//   Can be used to control which DOM events, when they bubble out
//   of this widget, the editor view should ignore.
//
//   key:: ?string
//   When comparing decorations of this type (in order to decide
//   whether it needs to be redrawn), ProseMirror will by default
//   compare the widget DOM node by identity. If you pass a key,
//   that key will be compared instead, which can be useful when
//   you generate decorations on the fly and don't want to store
//   and reuse DOM nodes. Make sure that any widgets with the same
//   key are interchangeable—if widgets differ in, for example,
//   the behavior of some event handler, they should get
//   different keys.
Decoration.widget = function widget (pos, toDOM, spec) {
  return new Decoration(pos, pos, new WidgetType(toDOM, spec))
};

// :: (number, number, DecorationAttrs, ?Object) → Decoration
// Creates an inline decoration, which adds the given attributes to
// each inline node between `from` and `to`.
//
// spec::- These options are recognized:
//
//   inclusiveStart:: ?bool
//   Determines how the left side of the decoration is
//   [mapped](#transform.Position_Mapping) when content is
//   inserted directly at that position. By default, the decoration
//   won't include the new content, but you can set this to `true`
//   to make it inclusive.
//
//   inclusiveEnd:: ?bool
//   Determines how the right side of the decoration is mapped.
//   See
//   [`inclusiveStart`](#view.Decoration^inline^spec.inclusiveStart).
Decoration.inline = function inline (from, to, attrs, spec) {
  return new Decoration(from, to, new InlineType(attrs, spec))
};

// :: (number, number, DecorationAttrs, ?Object) → Decoration
// Creates a node decoration. `from` and `to` should point precisely
// before and after a node in the document. That node, and only that
// node, will receive the given attributes.
Decoration.node = function node (from, to, attrs, spec) {
  return new Decoration(from, to, new NodeType(attrs, spec))
};

// :: Object
// The spec provided when creating this decoration. Can be useful
// if you've stored extra information in that object.
prototypeAccessors$2.spec.get = function () { return this.type.spec };

Object.defineProperties( Decoration.prototype, prototypeAccessors$2 );

// DecorationAttrs:: interface
// A set of attributes to add to a decorated node. Most properties
// simply directly correspond to DOM attributes of the same name,
// which will be set to the property's value. These are exceptions:
//
//   class:: ?string
//   A CSS class name or a space-separated set of class names to be
//   _added_ to the classes that the node already had.
//
//   style:: ?string
//   A string of CSS to be _added_ to the node's existing `style` property.
//
//   nodeName:: ?string
//   When non-null, the target node is wrapped in a DOM element of
//   this type (and the other attributes are applied to this element).

var none = [];
var noSpec = {};

// ::- A collection of [decorations](#view.Decoration), organized in
// such a way that the drawing algorithm can efficiently use and
// compare them. This is a persistent data structure—it is not
// modified, updates create a new value.
var DecorationSet = function DecorationSet(local, children) {
  this.local = local && local.length ? local : none;
  this.children = children && children.length ? children : none;
};

// :: (Node, [Decoration]) → DecorationSet
// Create a set of decorations, using the structure of the given
// document.
DecorationSet.create = function create (doc, decorations) {
  return decorations.length ? buildTree(decorations, doc, 0, noSpec) : empty
};

// :: (?number, ?number, ?(spec: Object) → bool) → [Decoration]
// Find all decorations in this set which touch the given range
// (including decorations that start or end directly at the
// boundaries) and match the given predicate on their spec. When
// `start` and `end` are omitted, all decorations in the set are
// considered. When `predicate` isn't given, all decorations are
// asssumed to match.
DecorationSet.prototype.find = function find (start, end, predicate) {
  var result = [];
  this.findInner(start == null ? 0 : start, end == null ? 1e9 : end, result, 0, predicate);
  return result
};

DecorationSet.prototype.findInner = function findInner (start, end, result, offset, predicate) {
    var this$1 = this;

  for (var i = 0; i < this.local.length; i++) {
    var span = this$1.local[i];
    if (span.from <= end && span.to >= start && (!predicate || predicate(span.spec)))
      { result.push(span.copy(span.from + offset, span.to + offset)); }
  }
  for (var i$1 = 0; i$1 < this.children.length; i$1 += 3) {
    if (this$1.children[i$1] < end && this$1.children[i$1 + 1] > start) {
      var childOff = this$1.children[i$1] + 1;
      this$1.children[i$1 + 2].findInner(start - childOff, end - childOff, result, offset + childOff, predicate);
    }
  }
};

// :: (Mapping, Node, ?Object) → DecorationSet
// Map the set of decorations in response to a change in the
// document.
//
// options::- An optional set of options.
//
//   onRemove:: ?(decorationSpec: Object)
//   When given, this function will be called for each decoration
//   that gets dropped as a result of the mapping, passing the
//   spec of that decoration.
DecorationSet.prototype.map = function map (mapping, doc, options) {
  if (this == empty || mapping.maps.length == 0) { return this }
  return this.mapInner(mapping, doc, 0, 0, options || noSpec)
};

DecorationSet.prototype.mapInner = function mapInner (mapping, node, offset, oldOffset, options) {
    var this$1 = this;

  var newLocal;
  for (var i = 0; i < this.local.length; i++) {
    var mapped = this$1.local[i].map(mapping, offset, oldOffset);
    if (mapped && mapped.type.valid(node, mapped)) { (newLocal || (newLocal = [])).push(mapped); }
    else if (options.onRemove) { options.onRemove(this$1.local[i].spec); }
  }

  if (this.children.length)
    { return mapChildren(this.children, newLocal, mapping, node, offset, oldOffset, options) }
  else
    { return newLocal ? new DecorationSet(newLocal.sort(byPos)) : empty }
};

// :: (Node, [Decoration]) → DecorationSet
// Add the given array of decorations to the ones in the set,
// producing a new set. Needs access to the current document to
// create the appropriate tree structure.
DecorationSet.prototype.add = function add (doc, decorations) {
  if (!decorations.length) { return this }
  if (this == empty) { return DecorationSet.create(doc, decorations) }
  return this.addInner(doc, decorations, 0)
};

DecorationSet.prototype.addInner = function addInner (doc, decorations, offset) {
    var this$1 = this;

  var children, childIndex = 0;
  doc.forEach(function (childNode, childOffset) {
    var baseOffset = childOffset + offset, found;
    if (!(found = takeSpansForNode(decorations, childNode, baseOffset))) { return }

    if (!children) { children = this$1.children.slice(); }
    while (childIndex < children.length && children[childIndex] < childOffset) { childIndex += 3; }
    if (children[childIndex] == childOffset)
      { children[childIndex + 2] = children[childIndex + 2].addInner(childNode, found, baseOffset + 1); }
    else
      { children.splice(childIndex, 0, childOffset, childOffset + childNode.nodeSize, buildTree(found, childNode, baseOffset + 1, noSpec)); }
    childIndex += 3;
  });

  var local = moveSpans(childIndex ? withoutNulls(decorations) : decorations, -offset);
  return new DecorationSet(local.length ? this.local.concat(local).sort(byPos) : this.local,
                           children || this.children)
};

// :: ([Decoration]) → DecorationSet
// Create a new set that contains the decorations in this set, minus
// the ones in the given array.
DecorationSet.prototype.remove = function remove (decorations) {
  if (decorations.length == 0 || this == empty) { return this }
  return this.removeInner(decorations, 0)
};

DecorationSet.prototype.removeInner = function removeInner (decorations, offset) {
    var this$1 = this;

  var children = this.children, local = this.local;
  for (var i = 0; i < children.length; i += 3) {
    var found = (void 0), from = children[i] + offset, to = children[i + 1] + offset;
    for (var j = 0, span = (void 0); j < decorations.length; j++) { if (span = decorations[j]) {
      if (span.from > from && span.to < to) {
        decorations[j] = null
        ;(found || (found = [])).push(span);
      }
    } }
    if (!found) { continue }
    if (children == this$1.children) { children = this$1.children.slice(); }
    var removed = children[i + 2].removeInner(found, from + 1);
    if (removed != empty) {
      children[i + 2] = removed;
    } else {
      children.splice(i, 3);
      i -= 3;
    }
  }
  if (local.length) { for (var i$1 = 0, span$1 = (void 0); i$1 < decorations.length; i$1++) { if (span$1 = decorations[i$1]) {
    for (var j$1 = 0; j$1 < local.length; j$1++) { if (local[j$1].type.eq(span$1.type)) {
      if (local == this$1.local) { local = this$1.local.slice(); }
      local.splice(j$1--, 1);
    } }
  } } }
  if (children == this.children && local == this.local) { return this }
  return local.length || children.length ? new DecorationSet(local, children) : empty
};

DecorationSet.prototype.forChild = function forChild (offset, node) {
    var this$1 = this;

  if (this == empty) { return this }
  if (node.isLeaf) { return DecorationSet.empty }

  var child, local;
  for (var i = 0; i < this.children.length; i += 3) { if (this$1.children[i] >= offset) {
    if (this$1.children[i] == offset) { child = this$1.children[i + 2]; }
    break
  } }
  var start = offset + 1, end = start + node.content.size;
  for (var i$1 = 0; i$1 < this.local.length; i$1++) {
    var dec = this$1.local[i$1];
    if (dec.from < end && dec.to > start && (dec.type instanceof InlineType)) {
      var from = Math.max(start, dec.from) - start, to = Math.min(end, dec.to) - start;
      if (from < to) { (local || (local = [])).push(dec.copy(from, to)); }
    }
  }
  if (local) {
    var localSet = new DecorationSet(local.sort(byPos));
    return child ? new DecorationGroup([localSet, child]) : localSet
  }
  return child || empty
};

DecorationSet.prototype.eq = function eq (other) {
    var this$1 = this;

  if (this == other) { return true }
  if (!(other instanceof DecorationSet) ||
      this.local.length != other.local.length ||
      this.children.length != other.children.length) { return false }
  for (var i = 0; i < this.local.length; i++)
    { if (!this$1.local[i].eq(other.local[i])) { return false } }
  for (var i$1 = 0; i$1 < this.children.length; i$1 += 3)
    { if (this$1.children[i$1] != other.children[i$1] ||
        this$1.children[i$1 + 1] != other.children[i$1 + 1] ||
        !this$1.children[i$1 + 2].eq(other.children[i$1 + 2])) { return false } }
  return false
};

DecorationSet.prototype.locals = function locals (node) {
  return removeOverlap(this.localsInner(node))
};

DecorationSet.prototype.localsInner = function localsInner (node) {
    var this$1 = this;

  if (this == empty) { return none }
  if (node.inlineContent || !this.local.some(InlineType.is)) { return this.local }
  var result = [];
  for (var i = 0; i < this.local.length; i++) {
    if (!(this$1.local[i].type instanceof InlineType))
      { result.push(this$1.local[i]); }
  }
  return result
};

var empty = new DecorationSet();

// :: DecorationSet
// The empty set of decorations.
DecorationSet.empty = empty;

DecorationSet.removeOverlap = removeOverlap;

// :- An abstraction that allows the code dealing with decorations to
// treat multiple DecorationSet objects as if it were a single object
// with (a subset of) the same interface.
var DecorationGroup = function DecorationGroup(members) {
  this.members = members;
};

DecorationGroup.prototype.forChild = function forChild (offset, child) {
    var this$1 = this;

  if (child.isLeaf) { return DecorationSet.empty }
  var found = [];
  for (var i = 0; i < this.members.length; i++) {
    var result = this$1.members[i].forChild(offset, child);
    if (result == empty) { continue }
    if (result instanceof DecorationGroup) { found = found.concat(result.members); }
    else { found.push(result); }
  }
  return DecorationGroup.from(found)
};

DecorationGroup.prototype.eq = function eq (other) {
    var this$1 = this;

  if (!(other instanceof DecorationGroup) ||
      other.members.length != this.members.length) { return false }
  for (var i = 0; i < this.members.length; i++)
    { if (!this$1.members[i].eq(other.members[i])) { return false } }
  return true
};

DecorationGroup.prototype.locals = function locals (node) {
    var this$1 = this;

  var result, sorted = true;
  for (var i = 0; i < this.members.length; i++) {
    var locals = this$1.members[i].localsInner(node);
    if (!locals.length) { continue }
    if (!result) {
      result = locals;
    } else {
      if (sorted) {
        result = result.slice();
        sorted = false;
      }
      for (var j = 0; j < locals.length; j++) { result.push(locals[j]); }
    }
  }
  return result ? removeOverlap(sorted ? result : result.sort(byPos)) : none
};

// : ([DecorationSet]) → union<DecorationSet, DecorationGroup>
// Create a group for the given array of decoration sets, or return
// a single set when possible.
DecorationGroup.from = function from (members) {
  switch (members.length) {
    case 0: return empty
    case 1: return members[0]
    default: return new DecorationGroup(members)
  }
};

function mapChildren(oldChildren, newLocal, mapping, node, offset, oldOffset, options) {
  var children = oldChildren.slice();

  // Mark the children that are directly touched by changes, and
  // move those that are after the changes.
  var shift = function (oldStart, oldEnd, newStart, newEnd) {
    for (var i = 0; i < children.length; i += 3) {
      var end = children[i + 1], dSize = (void 0);
      if (end == -1 || oldStart > end + oldOffset) { continue }
      if (oldEnd >= children[i] + oldOffset) {
        children[i + 1] = -1;
      } else if (dSize = (newEnd - newStart) - (oldEnd - oldStart) + (oldOffset - offset)) {
        children[i] += dSize;
        children[i + 1] += dSize;
      }
    }
  };
  for (var i = 0; i < mapping.maps.length; i++) { mapping.maps[i].forEach(shift); }

  // Find the child nodes that still correspond to a single node,
  // recursively call mapInner on them and update their positions.
  var mustRebuild = false;
  for (var i$1 = 0; i$1 < children.length; i$1 += 3) { if (children[i$1 + 1] == -1) { // Touched nodes
    var from = mapping.map(children[i$1] + oldOffset), fromLocal = from - offset;
    if (fromLocal < 0 || fromLocal >= node.content.size) {
      mustRebuild = true;
      continue
    }
    // Must read oldChildren because children was tagged with -1
    var to = mapping.map(oldChildren[i$1 + 1] + oldOffset, -1), toLocal = to - offset;
    var ref = node.content.findIndex(fromLocal);
    var index = ref.index;
    var childOffset = ref.offset;
    var childNode = node.maybeChild(index);
    if (childNode && childOffset == fromLocal && childOffset + childNode.nodeSize == toLocal) {
      var mapped = children[i$1 + 2].mapInner(mapping, childNode, from + 1, children[i$1] + oldOffset + 1, options);
      if (mapped != empty) {
        children[i$1] = fromLocal;
        children[i$1 + 1] = toLocal;
        children[i$1 + 2] = mapped;
      } else {
        children[i$1 + 1] = -2;
        mustRebuild = true;
      }
    } else {
      mustRebuild = true;
    }
  } }

  // Remaining children must be collected and rebuilt into the appropriate structure
  if (mustRebuild) {
    var decorations = mapAndGatherRemainingDecorations(children, oldChildren, newLocal || [], mapping,
                                                       offset, oldOffset, options);
    var built = buildTree(decorations, node, 0, options);
    newLocal = built.local;
    for (var i$2 = 0; i$2 < children.length; i$2 += 3) { if (children[i$2 + 1] < 0) {
      children.splice(i$2, 3);
      i$2 -= 3;
    } }
    for (var i$3 = 0, j = 0; i$3 < built.children.length; i$3 += 3) {
      var from$1 = built.children[i$3];
      while (j < children.length && children[j] < from$1) { j += 3; }
      children.splice(j, 0, built.children[i$3], built.children[i$3 + 1], built.children[i$3 + 2]);
    }
  }

  return new DecorationSet(newLocal && newLocal.sort(byPos), children)
}

function moveSpans(spans, offset) {
  if (!offset || !spans.length) { return spans }
  var result = [];
  for (var i = 0; i < spans.length; i++) {
    var span = spans[i];
    result.push(new Decoration(span.from + offset, span.to + offset, span.type));
  }
  return result
}

function mapAndGatherRemainingDecorations(children, oldChildren, decorations, mapping, offset, oldOffset, options) {
  // Gather all decorations from the remaining marked children
  function gather(set, oldOffset) {
    for (var i = 0; i < set.local.length; i++) {
      var mapped = set.local[i].map(mapping, offset, oldOffset);
      if (mapped) { decorations.push(mapped); }
      else if (options.onRemove) { options.onRemove(set.local[i].spec); }
    }
    for (var i$1 = 0; i$1 < set.children.length; i$1 += 3)
      { gather(set.children[i$1 + 2], set.children[i$1] + oldOffset + 1); }
  }
  for (var i = 0; i < children.length; i += 3) { if (children[i + 1] == -1)
    { gather(children[i + 2], oldChildren[i] + oldOffset + 1); } }

  return decorations
}

function takeSpansForNode(spans, node, offset) {
  if (node.isLeaf) { return null }
  var end = offset + node.nodeSize, found = null;
  for (var i = 0, span = (void 0); i < spans.length; i++) {
    if ((span = spans[i]) && span.from > offset && span.to < end) {
      (found || (found = [])).push(span);
      spans[i] = null;
    }
  }
  return found
}

function withoutNulls(array) {
  var result = [];
  for (var i = 0; i < array.length; i++)
    { if (array[i] != null) { result.push(array[i]); } }
  return result
}

// : ([Decoration], Node, number) → DecorationSet
// Build up a tree that corresponds to a set of decorations. `offset`
// is a base offset that should be subtractet from the `from` and `to`
// positions in the spans (so that we don't have to allocate new spans
// for recursive calls).
function buildTree(spans, node, offset, options) {
  var children = [], hasNulls = false;
  node.forEach(function (childNode, localStart) {
    var found = takeSpansForNode(spans, childNode, localStart + offset);
    if (found) {
      hasNulls = true;
      var subtree = buildTree(found, childNode, offset + localStart + 1, options);
      if (subtree != empty)
        { children.push(localStart, localStart + childNode.nodeSize, subtree); }
    }
  });
  var locals = moveSpans(hasNulls ? withoutNulls(spans) : spans, -offset).sort(byPos);
  for (var i = 0; i < locals.length; i++) { if (!locals[i].type.valid(node, locals[i])) {
    if (options.onRemove) { options.onRemove(locals[i].spec); }
    locals.splice(i--, 1);
  } }
  return locals.length || children.length ? new DecorationSet(locals, children) : empty
}

// : (Decoration, Decoration) → number
// Used to sort decorations so that ones with a low start position
// come first, and within a set with the same start position, those
// with an smaller end position come first.
function byPos(a, b) {
  return a.from - b.from || a.to - b.to
}

// : ([Decoration]) → [Decoration]
// Scan a sorted array of decorations for partially overlapping spans,
// and split those so that only fully overlapping spans are left (to
// make subsequent rendering easier). Will return the input array if
// no partially overlapping spans are found (the common case).
function removeOverlap(spans) {
  var working = spans;
  for (var i = 0; i < working.length - 1; i++) {
    var span = working[i];
    if (span.from != span.to) { for (var j = i + 1; j < working.length; j++) {
      var next = working[j];
      if (next.from == span.from) {
        if (next.to != span.to) {
          if (working == spans) { working = spans.slice(); }
          // Followed by a partially overlapping larger span. Split that
          // span.
          working[j] = next.copy(next.from, span.to);
          insertAhead(working, j + 1, next.copy(span.to, next.to));
        }
        continue
      } else {
        if (next.from < span.to) {
          if (working == spans) { working = spans.slice(); }
          // The end of this one overlaps with a subsequent span. Split
          // this one.
          working[i] = span.copy(span.from, next.from);
          insertAhead(working, j, span.copy(next.from, span.to));
        }
        break
      }
    } }
  }
  return working
}

function insertAhead(array, i, deco) {
  while (i < array.length && byPos(deco, array[i]) > 0) { i++; }
  array.splice(i, 0, deco);
}

// : (EditorView) → union<DecorationSet, DecorationGroup>
// Get the decorations associated with the current props of a view.
function viewDecorations(view) {
  var found = [];
  view.someProp("decorations", function (f) {
    var result = f(view.state);
    if (result && result != empty) { found.push(result); }
  });
  if (view.cursorWrapper)
    { found.push(DecorationSet.create(view.state.doc, [view.cursorWrapper.deco])); }
  return DecorationGroup.from(found)
}

// ::- An editor view manages the DOM structure that represents an
// editable document. Its state and behavior are determined by its
// [props](#view.DirectEditorProps).
var EditorView = function EditorView(place, props) {
  this._props = props;
  // :: EditorState
  // The view's current [state](#state.EditorState).
  this.state = props.state;

  this.dispatch = this.dispatch.bind(this);

  this._root = null;
  this.focused = false;

  // :: dom.Element
  // An editable DOM node containing the document. (You probably
  // should not directly interfere with its content.)
  this.dom = (place && place.mount) || document.createElement("div");
  if (place) {
    if (place.appendChild) { place.appendChild(this.dom); }
    else if (place.apply) { place(this.dom); }
    else if (place.mount) { this.mounted = true; }
  }

  this.editable = getEditable(this);
  this.cursorWrapper = null;
  updateCursorWrapper(this);
  this.nodeViews = buildNodeViews(this);
  this.docView = docViewDesc(this.state.doc, computeDocDeco(this), viewDecorations(this), this.dom, this);

  this.lastSelectedViewDesc = null;
  // :: ?{slice: Slice, move: bool}
  // When editor content is being dragged, this object contains
  // information about the dragged slice and whether it is being
  // copied or moved. At any other time, it is null.
  this.dragging = null;

  initInput(this);

  this.pluginViews = [];
  this.updatePluginViews();
};

var prototypeAccessors = { props: {},root: {} };

// composing:: boolean
// Holds `true` when a
// [composition](https://developer.mozilla.org/en-US/docs/Mozilla/IME_handling_guide)
// is active.

// :: DirectEditorProps
// The view's current [props](#view.EditorProps).
prototypeAccessors.props.get = function () {
    var this$1 = this;

  if (this._props.state != this.state) {
    var prev = this._props;
    this._props = {};
    for (var name in prev) { this$1._props[name] = prev[name]; }
    this._props.state = this.state;
  }
  return this._props
};

// :: (DirectEditorProps)
// Update the view's props. Will immediately cause an update to
// the DOM.
EditorView.prototype.update = function update (props) {
  if (props.handleDOMEvents != this._props.handleDOMEvents) { ensureListeners(this); }
  this._props = props;
  this.updateStateInner(props.state, true);
};

// :: (DirectEditorProps)
// Update the view by updating existing props object with the object
// given as argument. Equivalent to `view.update(Object.assign({},
// view.props, props))`.
EditorView.prototype.setProps = function setProps (props) {
    var this$1 = this;

  var updated = {};
  for (var name in this$1._props) { updated[name] = this$1._props[name]; }
  updated.state = this.state;
  for (var name$1 in props) { updated[name$1] = props[name$1]; }
  this.update(updated);
};

// :: (EditorState)
// Update the editor's `state` prop, without touching any of the
// other props.
EditorView.prototype.updateState = function updateState (state) {
  this.updateStateInner(state, this.state.plugins != state.plugins);
};

EditorView.prototype.updateStateInner = function updateStateInner (state, reconfigured) {
    var this$1 = this;

  var prev = this.state, redraw = false;
  this.state = state;
  if (reconfigured) {
    var nodeViews = buildNodeViews(this);
    if (changedNodeViews(nodeViews, this.nodeViews)) {
      this.nodeViews = nodeViews;
      redraw = true;
    }
    ensureListeners(this);
  }

  this.editable = getEditable(this);
  updateCursorWrapper(this);
  var innerDeco = viewDecorations(this), outerDeco = computeDocDeco(this);

  var scroll = reconfigured ? "reset"
      : state.scrollToSelection > prev.scrollToSelection ? "to selection" : "preserve";
  var updateDoc = redraw || !this.docView.matchesNode(state.doc, outerDeco, innerDeco);
  var updateSel = updateDoc || !state.selection.eq(prev.selection);
  var oldScrollPos = scroll == "preserve" && updateSel && this.dom.style.overflowAnchor == null && storeScrollPos(this);

  if (updateSel) {
    this.domObserver.stop();
    var forceSelUpdate = false;
    if (updateDoc) {
      // Work around an issue in Chrome where changing the DOM
      // around the active selection puts it into a broken state
      // where the thing the user sees differs from the selection
      // reported by the Selection object (#710)
      var startSelContext = result.chrome && selectionContext(this.root);
      if (redraw || !this.docView.update(state.doc, outerDeco, innerDeco, this)) {
        this.docView.destroy();
        this.docView = docViewDesc(state.doc, outerDeco, innerDeco, this.dom, this);
      }
      if (startSelContext)
        { forceSelUpdate = needChromeSelectionForce(startSelContext, this.root); }
    }
    // Work around for an issue where an update arriving right between
    // a DOM selection change and the "selectionchange" event for it
    // can cause a spurious DOM selection update, disrupting mouse
    // drag selection.
    if (forceSelUpdate ||
        !(this.mouseDown && this.domObserver.currentSelection.eq(this.root.getSelection()) && anchorInRightPlace(this))) {
      selectionToDOM(this, false, forceSelUpdate);
    } else {
      syncNodeSelection(this, state.selection);
      this.domObserver.setCurSelection();
    }
    this.domObserver.start();
  }

  this.updatePluginViews(prev);

  if (scroll == "reset") {
    this.dom.scrollTop = 0;
  } else if (scroll == "to selection") {
    var startDOM = this.root.getSelection().focusNode;
    if (this.someProp("handleScrollToSelection", function (f) { return f(this$1); }))
      {} // Handled
    else if (state.selection instanceof prosemirrorState.NodeSelection)
      { scrollRectIntoView(this, this.docView.domAfterPos(state.selection.from).getBoundingClientRect(), startDOM); }
    else
      { scrollRectIntoView(this, this.coordsAtPos(state.selection.head), startDOM); }
  } else if (oldScrollPos) {
    resetScrollPos(oldScrollPos);
  }
};

EditorView.prototype.destroyPluginViews = function destroyPluginViews () {
  var view;
  while (view = this.pluginViews.pop()) { if (view.destroy) { view.destroy(); } }
};

EditorView.prototype.updatePluginViews = function updatePluginViews (prevState) {
    var this$1 = this;

  if (!prevState || prevState.plugins != this.state.plugins) {
    this.destroyPluginViews();
    for (var i = 0; i < this.state.plugins.length; i++) {
      var plugin = this$1.state.plugins[i];
      if (plugin.spec.view) { this$1.pluginViews.push(plugin.spec.view(this$1)); }
    }
  } else {
    for (var i$1 = 0; i$1 < this.pluginViews.length; i$1++) {
      var pluginView = this$1.pluginViews[i$1];
      if (pluginView.update) { pluginView.update(this$1, prevState); }
    }
  }
};

// :: (string, ?(prop: *) → *) → *
// Goes over the values of a prop, first those provided directly,
// then those from plugins (in order), and calls `f` every time a
// non-undefined value is found. When `f` returns a truthy value,
// that is immediately returned. When `f` isn't provided, it is
// treated as the identity function (the prop value is returned
// directly).
EditorView.prototype.someProp = function someProp (propName, f) {
  var prop = this._props && this._props[propName], value;
  if (prop != null && (value = f ? f(prop) : prop)) { return value }
  var plugins = this.state.plugins;
  if (plugins) { for (var i = 0; i < plugins.length; i++) {
    var prop$1 = plugins[i].props[propName];
    if (prop$1 != null && (value = f ? f(prop$1) : prop$1)) { return value }
  } }
};

// :: () → bool
// Query whether the view has focus.
EditorView.prototype.hasFocus = function hasFocus () {
  return this.root.activeElement == this.dom
};

// :: ()
// Focus the editor.
EditorView.prototype.focus = function focus () {
  this.domObserver.stop();
  selectionToDOM(this, true);
  this.domObserver.start();
  if (this.editable) { this.dom.focus(); }
};

// :: union<dom.Document, dom.DocumentFragment>
// Get the document root in which the editor exists. This will
// usually be the top-level `document`, but might be a [shadow
// DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
// root if the editor is inside one.
prototypeAccessors.root.get = function () {
    var this$1 = this;

  var cached = this._root;
  if (cached == null) { for (var search = this.dom.parentNode; search; search = search.parentNode) {
    if (search.nodeType == 9 || (search.nodeType == 11 && search.host))
      { return this$1._root = search }
  } }
  return cached || document
};

// :: ({left: number, top: number}) → ?{pos: number, inside: number}
// Given a pair of viewport coordinates, return the document
// position that corresponds to them. May return null if the given
// coordinates aren't inside of the editor. When an object is
// returned, its `pos` property is the position nearest to the
// coordinates, and its `inside` property holds the position of the
// inner node that the position falls inside of, or -1 if it is at
// the top level, not in any node.
EditorView.prototype.posAtCoords = function posAtCoords$1 (coords) {
  return posAtCoords(this, coords)
};

// :: (number) → {left: number, right: number, top: number, bottom: number}
// Returns the viewport rectangle at a given document position. `left`
// and `right` will be the same number, as this returns a flat
// cursor-ish rectangle.
EditorView.prototype.coordsAtPos = function coordsAtPos$1 (pos) {
  return coordsAtPos(this, pos)
};

// :: (number) → {node: dom.Node, offset: number}
// Find the DOM position that corresponds to the given document
// position. Note that you should **not** mutate the editor's
// internal DOM, only inspect it (and even that is usually not
// necessary).
EditorView.prototype.domAtPos = function domAtPos (pos) {
  return this.docView.domFromPos(pos)
};

// :: (number) → ?dom.Node
// Find the DOM node that represents the document node after the
// given position. May return `null` when the position doesn't point
// in front of a node or if the node is inside an opaque node view.
//
// This is intended to be able to call things like
// `getBoundingClientRect` on that DOM node. Do **not** mutate the
// editor DOM directly, or add styling this way, since that will be
// immediately overriden by the editor as it redraws the node.
EditorView.prototype.nodeDOM = function nodeDOM (pos) {
  var desc = this.docView.descAt(pos);
  return desc ? desc.nodeDOM : null
};

// :: (dom.Node, number, ?number) → number
// Find the document position that corresponds to a given DOM
// position. (Whenever possible, it is preferable to inspect the
// document structure directly, rather than poking around in the
// DOM, but sometimes—for example when interpreting an event
// target—you don't have a choice.)
//
// The `bias` parameter can be used to influence which side of a DOM
// node to use when the position is inside a leaf node.
EditorView.prototype.posAtDOM = function posAtDOM (node, offset, bias) {
    if ( bias === void 0 ) bias = -1;

  var pos = this.docView.posFromDOM(node, offset, bias);
  if (pos == null) { throw new RangeError("DOM position not inside the editor") }
  return pos
};

// :: (union<"up", "down", "left", "right", "forward", "backward">, ?EditorState) → bool
// Find out whether the selection is at the end of a textblock when
// moving in a given direction. When, for example, given `"left"`,
// it will return true if moving left from the current cursor
// position would leave that position's parent textblock. Will apply
// to the view's current state by default, but it is possible to
// pass a different state.
EditorView.prototype.endOfTextblock = function endOfTextblock$1 (dir, state) {
  return endOfTextblock(this, state || this.state, dir)
};

// :: ()
// Removes the editor from the DOM and destroys all [node
// views](#view.NodeView).
EditorView.prototype.destroy = function destroy () {
  if (!this.docView) { return }
  destroyInput(this);
  this.destroyPluginViews();
  if (this.mounted) {
    this.docView.update(this.state.doc, [], viewDecorations(this), this);
    this.dom.textContent = "";
  } else if (this.dom.parentNode) {
    this.dom.parentNode.removeChild(this.dom);
  }
  this.docView.destroy();
  this.docView = null;
};

// Used for testing.
EditorView.prototype.dispatchEvent = function dispatchEvent$1 (event) {
  return dispatchEvent(this, event)
};

// :: (Transaction)
// Dispatch a transaction. Will call
// [`dispatchTransaction`](#view.DirectEditorProps.dispatchTransaction)
// when given, and otherwise defaults to applying the transaction to
// the current state and calling
// [`updateState`](#view.EditorView.updateState) with the result.
// This method is bound to the view instance, so that it can be
// easily passed around.
EditorView.prototype.dispatch = function dispatch (tr) {
  var dispatchTransaction = this._props.dispatchTransaction;
  if (dispatchTransaction) { dispatchTransaction.call(this, tr); }
  else { this.updateState(this.state.apply(tr)); }
};

Object.defineProperties( EditorView.prototype, prototypeAccessors );

function computeDocDeco(view) {
  var attrs = Object.create(null);
  attrs.class = "ProseMirror";
  attrs.contenteditable = String(view.editable);

  view.someProp("attributes", function (value) {
    if (typeof value == "function") { value = value(view.state); }
    if (value) { for (var attr in value) {
      if (attr == "class")
        { attrs.class += " " + value[attr]; }
      else if (!attrs[attr] && attr != "contenteditable" && attr != "nodeName")
        { attrs[attr] = String(value[attr]); }
    } }
  });

  return [Decoration.node(0, view.state.doc.content.size, attrs)]
}

function cursorWrapperDOM(visible) {
  var span = document.createElement("span");
  span.textContent = "\ufeff"; // zero-width non-breaking space
  if (!visible) {
    span.style.position = "absolute";
    span.style.left = "-100000px";
  }
  return span
}

function updateCursorWrapper(view) {
  var $pos = needsCursorWrapper(view.state);
  // On IE/Edge, moving the DOM selection will abort a mouse drag, so
  // there we delay the creation of the wrapper when the mouse is down.
  if ($pos && !(result.ie && view.mouseDown)) {
    var visible = view.state.selection.visible;
    // Needs a cursor wrapper
    var marks = view.state.storedMarks || $pos.marks(), dom;
    if (!view.cursorWrapper || !prosemirrorModel.Mark.sameSet(view.cursorWrapper.deco.spec.marks, marks) ||
        view.cursorWrapper.dom.textContent != "\ufeff" ||
        view.cursorWrapper.deco.spec.visible != visible)
      { dom = cursorWrapperDOM(visible); }
    else if (view.cursorWrapper.deco.pos != $pos.pos)
      { dom = view.cursorWrapper.dom; }
    if (dom)
      { view.cursorWrapper = {dom: dom, deco: Decoration.widget($pos.pos, dom, {isCursorWrapper: true, marks: marks, raw: true, visible: visible})}; }
  } else {
    view.cursorWrapper = null;
  }
}

function getEditable(view) {
  return !view.someProp("editable", function (value) { return value(view.state) === false; })
}

function selectionContext(root) {
  var ref = root.getSelection();
  var offset = ref.focusOffset;
  var node = ref.focusNode;
  if (!node || node.nodeType == 3) { return null }
  return [node, offset,
          node.nodeType == 1 ? node.childNodes[offset - 1] : null,
          node.nodeType == 1 ? node.childNodes[offset] : null]
}

function needChromeSelectionForce(context, root) {
  var newContext = selectionContext(root);
  if (!newContext || newContext[0].nodeType == 3) { return false }
  for (var i = 0; i < context.length; i++) { if (newContext[i] != context[i]) { return true } }
  return false
}

function buildNodeViews(view) {
  var result$$1 = {};
  view.someProp("nodeViews", function (obj) {
    for (var prop in obj) { if (!Object.prototype.hasOwnProperty.call(result$$1, prop))
      { result$$1[prop] = obj[prop]; } }
  });
  return result$$1
}

function changedNodeViews(a, b) {
  var nA = 0, nB = 0;
  for (var prop in a) {
    if (a[prop] != b[prop]) { return true }
    nA++;
  }
  for (var _ in b) { nB++; }
  return nA != nB
}

// EditorProps:: interface
//
// Props are configuration values that can be passed to an editor view
// or included in a plugin. This interface lists the supported props.
//
// The various event-handling functions may all return `true` to
// indicate that they handled the given event. The view will then take
// care to call `preventDefault` on the event, except with
// `handleDOMEvents`, where the handler itself is responsible for that.
//
// How a prop is resolved depends on the prop. Handler functions are
// called one at a time, starting with the base props and then
// searching through the plugins (in order of appearance) until one of
// them returns true. For some props, the first plugin that yields a
// value gets precedence.
//
//   handleDOMEvents:: ?Object<(view: EditorView, event: dom.Event) → bool>
//   Can be an object mapping DOM event type names to functions that
//   handle them. Such functions will be called before any handling
//   ProseMirror does of events fired on the editable DOM element.
//   Contrary to the other event handling props, when returning true
//   from such a function, you are responsible for calling
//   `preventDefault` yourself (or not, if you want to allow the
//   default behavior).
//
//   handleKeyDown:: ?(view: EditorView, event: dom.KeyboardEvent) → bool
//   Called when the editor receives a `keydown` event.
//
//   handleKeyPress:: ?(view: EditorView, event: dom.KeyboardEvent) → bool
//   Handler for `keypress` events.
//
//   handleTextInput:: ?(view: EditorView, from: number, to: number, text: string) → bool
//   Whenever the user directly input text, this handler is called
//   before the input is applied. If it returns `true`, the default
//   behavior of actually inserting the text is suppressed.
//
//   handleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
//   Called for each node around a click, from the inside out. The
//   `direct` flag will be true for the inner node.
//
//   handleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
//   Called when the editor is clicked, after `handleClickOn` handlers
//   have been called.
//
//   handleDoubleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
//   Called for each node around a double click.
//
//   handleDoubleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
//   Called when the editor is double-clicked, after `handleDoubleClickOn`.
//
//   handleTripleClickOn:: ?(view: EditorView, pos: number, node: Node, nodePos: number, event: dom.MouseEvent, direct: bool) → bool
//   Called for each node around a triple click.
//
//   handleTripleClick:: ?(view: EditorView, pos: number, event: dom.MouseEvent) → bool
//   Called when the editor is triple-clicked, after `handleTripleClickOn`.
//
//   handlePaste:: ?(view: EditorView, event: dom.Event, slice: Slice) → bool
//   Can be used to override the behavior of pasting. `slice` is the
//   pasted content parsed by the editor, but you can directly access
//   the event to get at the raw content.
//
//   handleDrop:: ?(view: EditorView, event: dom.Event, slice: Slice, moved: bool) → bool
//   Called when something is dropped on the editor. `moved` will be
//   true if this drop moves from the current selection (which should
//   thus be deleted).
//
//   handleScrollToSelection:: ?(view: EditorView) → bool
//   Called when the view, after updating its state, tries to scroll
//   the selection into view. A handler function may return false to
//   indicate that it did not handle the scrolling and further
//   handlers or the default behavior should be tried.
//
//   createSelectionBetween:: ?(view: EditorView, anchor: ResolvedPos, head: ResolvedPos) → ?Selection
//   Can be used to override the way a selection is created when
//   reading a DOM selection between the given anchor and head.
//
//   domParser:: ?DOMParser
//   The [parser](#model.DOMParser) to use when reading editor changes
//   from the DOM. Defaults to calling
//   [`DOMParser.fromSchema`](#model.DOMParser^fromSchema) on the
//   editor's schema.
//
//   transformPastedHTML:: ?(html: string) → string
//   Can be used to transform pasted HTML text, _before_ it is parsed,
//   for example to clean it up.
//
//   clipboardParser:: ?DOMParser
//   The [parser](#model.DOMParser) to use when reading content from
//   the clipboard. When not given, the value of the
//   [`domParser`](#view.EditorProps.domParser) prop is used.
//
//   transformPastedText:: ?(text: string) → string
//   Transform pasted plain text.
//
//   clipboardTextParser:: ?(text: string, $context: ResolvedPos) → Slice
//   A function to parse text from the clipboard into a document
//   slice. Called after
//   [`transformPastedText`](#view.EditorProps.transformPastedText).
//   The default behavior is to split the text into lines, wrap them
//   in `<p>` tags, and call
//   [`clipboardParser`](#view.EditorProps.clipboardParser) on it.
//
//   transformPasted:: ?(Slice) → Slice
//   Can be used to transform pasted content before it is applied to
//   the document.
//
//   nodeViews:: ?Object<(node: Node, view: EditorView, getPos: () → number, decorations: [Decoration]) → NodeView>
//   Allows you to pass custom rendering and behavior logic for nodes
//   and marks. Should map node and mark names to constructor
//   functions that produce a [`NodeView`](#view.NodeView) object
//   implementing the node's display behavior. For nodes, the third
//   argument `getPos` is a function that can be called to get the
//   node's current position, which can be useful when creating
//   transactions to update it. For marks, the third argument is a
//   boolean that indicates whether the mark's content is inline.
//
//   `decorations` is an array of node or inline decorations that are
//   active around the node. They are automatically drawn in the
//   normal way, and you will usually just want to ignore this, but
//   they can also be used as a way to provide context information to
//   the node view without adding it to the document itself.
//
//   clipboardSerializer:: ?DOMSerializer
//   The DOM serializer to use when putting content onto the
//   clipboard. If not given, the result of
//   [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)
//   will be used.
//
//   clipboardTextSerializer:: ?(Slice) → string
//   A function that will be called to get the text for the current
//   selection when copying text to the clipboard. By default, the
//   editor will use [`textBetween`](#model.Node.textBetween) on the
//   selected range.
//
//   decorations:: ?(state: EditorState) → ?DecorationSet
//   A set of [document decorations](#view.Decoration) to show in the
//   view.
//
//   editable:: ?(state: EditorState) → bool
//   When this returns false, the content of the view is not directly
//   editable.
//
//   attributes:: ?union<Object<string>, (EditorState) → ?Object<string>>
//   Control the DOM attributes of the editable element. May be either
//   an object or a function going from an editor state to an object.
//   By default, the element will get a class `"ProseMirror"`, and
//   will have its `contentEditable` attribute determined by the
//   [`editable` prop](#view.EditorProps.editable). Additional classes
//   provided here will be added to the class. For other attributes,
//   the value provided first (as in
//   [`someProp`](#view.EditorView.someProp)) will be used.
//
//   scrollThreshold:: ?union<number, {top: number, right: number, bottom: number, left: number}>
//   Determines the distance (in pixels) between the cursor and the
//   end of the visible viewport at which point, when scrolling the
//   cursor into view, scrolling takes place. Defaults to 0.
//
//   scrollMargin:: ?union<number, {top: number, right: number, bottom: number, left: number}>
//   Determines the extra space (in pixels) that is left above or
//   below the cursor when it is scrolled into view. Defaults to 5.

// DirectEditorProps:: interface extends EditorProps
//
// The props object given directly to the editor view supports two
// fields that can't be used in plugins:
//
//   state:: EditorState
//   The current state of the editor.
//
//   dispatchTransaction:: ?(tr: Transaction)
//   The callback over which to send transactions (state updates)
//   produced by the view. If you specify this, you probably want to
//   make sure this ends up calling the view's
//   [`updateState`](#view.EditorView.updateState) method with a new
//   state that has the transaction
//   [applied](#state.EditorState.apply). The callback will be bound to have
//   the view instance as its `this` binding.

exports.EditorView = EditorView;
exports.Decoration = Decoration;
exports.DecorationSet = DecorationSet;
exports.__serializeForClipboard = serializeForClipboard;
exports.__parseFromClipboard = parseFromClipboard;
exports.__endComposition = endComposition;
//# sourceMappingURL=index.js.map

},{"prosemirror-model":"../node_modules/prosemirror-model/dist/index.js","prosemirror-state":"../node_modules/prosemirror-state/dist/index.js","prosemirror-transform":"../node_modules/prosemirror-transform/dist/index.js"}],"../node_modules/rope-sequence/dist/index.js":[function(require,module,exports) {
var GOOD_LEAF_SIZE = 200

// :: class<T> A rope sequence is a persistent sequence data structure
// that supports appending, prepending, and slicing without doing a
// full copy. It is represented as a mostly-balanced tree.
var RopeSequence = function RopeSequence () {};

RopeSequence.prototype.append = function append (other) {
  if (!other.length) { return this }
  other = RopeSequence.from(other)

  return (!this.length && other) ||
    (other.length < GOOD_LEAF_SIZE && this.leafAppend(other)) ||
    (this.length < GOOD_LEAF_SIZE && other.leafPrepend(this)) ||
    this.appendInner(other)
};

// :: (union<[T], RopeSequence<T>>) → RopeSequence<T>
// Prepend an array or other rope to this one, returning a new rope.
RopeSequence.prototype.prepend = function prepend (other) {
  if (!other.length) { return this }
  return RopeSequence.from(other).append(this)
};

RopeSequence.prototype.appendInner = function appendInner (other) {
  return new Append(this, other)
};

// :: (?number, ?number) → RopeSequence<T>
// Create a rope repesenting a sub-sequence of this rope.
RopeSequence.prototype.slice = function slice (from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  if (from >= to) { return RopeSequence.empty }
  return this.sliceInner(Math.max(0, from), Math.min(this.length, to))
};

// :: (number) → T
// Retrieve the element at the given position from this rope.
RopeSequence.prototype.get = function get (i) {
  if (i < 0 || i >= this.length) { return undefined }
  return this.getInner(i)
};

// :: ((element: T, index: number) → ?bool, ?number, ?number)
// Call the given function for each element between the given
// indices. This tends to be more efficient than looping over the
// indices and calling `get`, because it doesn't have to descend the
// tree for every element.
RopeSequence.prototype.forEach = function forEach (f, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  if (from <= to)
    { this.forEachInner(f, from, to, 0) }
  else
    { this.forEachInvertedInner(f, from, to, 0) }
};

// :: ((element: T, index: number) → U, ?number, ?number) → [U]
// Map the given functions over the elements of the rope, producing
// a flat array.
RopeSequence.prototype.map = function map (f, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  var result = []
  this.forEach(function (elt, i) { return result.push(f(elt, i)); }, from, to)
  return result
};

// :: (?union<[T], RopeSequence<T>>) → RopeSequence<T>
// Create a rope representing the given array, or return the rope
// itself if a rope was given.
RopeSequence.from = function from (values) {
  if (values instanceof RopeSequence) { return values }
  return values && values.length ? new Leaf(values) : RopeSequence.empty
};

var Leaf = (function (RopeSequence) {
  function Leaf(values) {
    RopeSequence.call(this)
    this.values = values
  }

  if ( RopeSequence ) Leaf.__proto__ = RopeSequence;
  Leaf.prototype = Object.create( RopeSequence && RopeSequence.prototype );
  Leaf.prototype.constructor = Leaf;

  var prototypeAccessors = { length: {},depth: {} };

  Leaf.prototype.flatten = function flatten () {
    return this.values
  };

  Leaf.prototype.sliceInner = function sliceInner (from, to) {
    if (from == 0 && to == this.length) { return this }
    return new Leaf(this.values.slice(from, to))
  };

  Leaf.prototype.getInner = function getInner (i) {
    return this.values[i]
  };

  Leaf.prototype.forEachInner = function forEachInner (f, from, to, start) {
    var this$1 = this;

    for (var i = from; i < to; i++)
      { if (f(this$1.values[i], start + i) === false) { return false } }
  };

  Leaf.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
    var this$1 = this;

    for (var i = from - 1; i >= to; i--)
      { if (f(this$1.values[i], start + i) === false) { return false } }
  };

  Leaf.prototype.leafAppend = function leafAppend (other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE)
      { return new Leaf(this.values.concat(other.flatten())) }
  };

  Leaf.prototype.leafPrepend = function leafPrepend (other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE)
      { return new Leaf(other.flatten().concat(this.values)) }
  };

  prototypeAccessors.length.get = function () { return this.values.length };

  prototypeAccessors.depth.get = function () { return 0 };

  Object.defineProperties( Leaf.prototype, prototypeAccessors );

  return Leaf;
}(RopeSequence));

// :: RopeSequence
// The empty rope sequence.
RopeSequence.empty = new Leaf([])

var Append = (function (RopeSequence) {
  function Append(left, right) {
    RopeSequence.call(this)
    this.left = left
    this.right = right
    this.length = left.length + right.length
    this.depth = Math.max(left.depth, right.depth) + 1
  }

  if ( RopeSequence ) Append.__proto__ = RopeSequence;
  Append.prototype = Object.create( RopeSequence && RopeSequence.prototype );
  Append.prototype.constructor = Append;

  Append.prototype.flatten = function flatten () {
    return this.left.flatten().concat(this.right.flatten())
  };

  Append.prototype.getInner = function getInner (i) {
    return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length)
  };

  Append.prototype.forEachInner = function forEachInner (f, from, to, start) {
    var leftLen = this.left.length
    if (from < leftLen &&
        this.left.forEachInner(f, from, Math.min(to, leftLen), start) === false)
      { return false }
    if (to > leftLen &&
        this.right.forEachInner(f, Math.max(from - leftLen, 0), Math.min(this.length, to) - leftLen, start + leftLen) === false)
      { return false }
  };

  Append.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
    var leftLen = this.left.length
    if (from > leftLen &&
        this.right.forEachInvertedInner(f, from - leftLen, Math.max(to, leftLen) - leftLen, start + leftLen) === false)
      { return false }
    if (to < leftLen &&
        this.left.forEachInvertedInner(f, Math.min(from, leftLen), to, start) === false)
      { return false }
  };

  Append.prototype.sliceInner = function sliceInner (from, to) {
    if (from == 0 && to == this.length) { return this }
    var leftLen = this.left.length
    if (to <= leftLen) { return this.left.slice(from, to) }
    if (from >= leftLen) { return this.right.slice(from - leftLen, to - leftLen) }
    return this.left.slice(from, leftLen).append(this.right.slice(0, to - leftLen))
  };

  Append.prototype.leafAppend = function leafAppend (other) {
    var inner = this.right.leafAppend(other)
    if (inner) { return new Append(this.left, inner) }
  };

  Append.prototype.leafPrepend = function leafPrepend (other) {
    var inner = this.left.leafPrepend(other)
    if (inner) { return new Append(inner, this.right) }
  };

  Append.prototype.appendInner = function appendInner (other) {
    if (this.left.depth >= Math.max(this.right.depth, other.depth) + 1)
      { return new Append(this.left, new Append(this.right, other)) }
    return new Append(this, other)
  };

  return Append;
}(RopeSequence));

module.exports = RopeSequence

},{}],"../node_modules/prosemirror-history/dist/history.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var RopeSequence = _interopDefault(require('rope-sequence'));
var prosemirrorTransform = require('prosemirror-transform');
var prosemirrorState = require('prosemirror-state');

// ProseMirror's history isn't simply a way to roll back to a previous
// state, because ProseMirror supports applying changes without adding
// them to the history (for example during collaboration).
//
// To this end, each 'Branch' (one for the undo history and one for
// the redo history) keeps an array of 'Items', which can optionally
// hold a step (an actual undoable change), and always hold a position
// map (which is needed to move changes below them to apply to the
// current document).
//
// An item that has both a step and a selection bookmark is the start
// of an 'event' — a group of changes that will be undone or redone at
// once. (It stores only the bookmark, since that way we don't have to
// provide a document until the selection is actually applied, which
// is useful when compressing.)

// Used to schedule history compression
var max_empty_items = 500;

var Branch = function Branch(items, eventCount) {
  this.items = items;
  this.eventCount = eventCount;
};

// : (EditorState, bool) → ?{transform: Transform, selection: ?SelectionBookmark, remaining: Branch}
// Pop the latest event off the branch's history and apply it
// to a document transform.
Branch.prototype.popEvent = function popEvent (state, preserveItems) {
    var this$1 = this;

  if (this.eventCount == 0) { return null }

  var end = this.items.length;
  for (;; end--) {
    var next = this$1.items.get(end - 1);
    if (next.selection) { --end; break }
  }

  var remap, mapFrom;
  if (preserveItems) {
    remap = this.remapping(end, this.items.length);
    mapFrom = remap.maps.length;
  }
  var transform = state.tr;
  var selection, remaining;
  var addAfter = [], addBefore = [];

  this.items.forEach(function (item, i) {
    if (!item.step) {
      if (!remap) {
        remap = this$1.remapping(end, i + 1);
        mapFrom = remap.maps.length;
      }
      mapFrom--;
      addBefore.push(item);
      return
    }

    if (remap) {
      addBefore.push(new Item(item.map));
      var step = item.step.map(remap.slice(mapFrom)), map;

      if (step && transform.maybeStep(step).doc) {
        map = transform.mapping.maps[transform.mapping.maps.length - 1];
        addAfter.push(new Item(map, null, null, addAfter.length + addBefore.length));
      }
      mapFrom--;
      if (map) { remap.appendMap(map, mapFrom); }
    } else {
      transform.maybeStep(item.step);
    }

    if (item.selection) {
      selection = remap ? item.selection.map(remap.slice(mapFrom)) : item.selection;
      remaining = new Branch(this$1.items.slice(0, end).append(addBefore.reverse().concat(addAfter)), this$1.eventCount - 1);
      return false
    }
  }, this.items.length, 0);

  return {remaining: remaining, transform: transform, selection: selection}
};

// : (Transform, ?SelectionBookmark, Object) → Branch
// Create a new branch with the given transform added.
Branch.prototype.addTransform = function addTransform (transform, selection, histOptions, preserveItems) {
  var newItems = [], eventCount = this.eventCount;
  var oldItems = this.items, lastItem = !preserveItems && oldItems.length ? oldItems.get(oldItems.length - 1) : null;

  for (var i = 0; i < transform.steps.length; i++) {
    var step = transform.steps[i].invert(transform.docs[i]);
    var item = new Item(transform.mapping.maps[i], step, selection), merged = (void 0);
    if (merged = lastItem && lastItem.merge(item)) {
      item = merged;
      if (i) { newItems.pop(); }
      else { oldItems = oldItems.slice(0, oldItems.length - 1); }
    }
    newItems.push(item);
    if (selection) {
      eventCount++;
      selection = null;
    }
    if (!preserveItems) { lastItem = item; }
  }
  var overflow = eventCount - histOptions.depth;
  if (overflow > DEPTH_OVERFLOW) {
    oldItems = cutOffEvents(oldItems, overflow);
    eventCount -= overflow;
  }
  return new Branch(oldItems.append(newItems), eventCount)
};

Branch.prototype.remapping = function remapping (from, to) {
  var maps = new prosemirrorTransform.Mapping;
  this.items.forEach(function (item, i) {
    var mirrorPos = item.mirrorOffset != null && i - item.mirrorOffset >= from
        ? mirrorPos = maps.maps.length - item.mirrorOffset : null;
    maps.appendMap(item.map, mirrorPos);
  }, from, to);
  return maps
};

Branch.prototype.addMaps = function addMaps (array) {
  if (this.eventCount == 0) { return this }
  return new Branch(this.items.append(array.map(function (map) { return new Item(map); })), this.eventCount)
};

// : (Transform, number)
// When the collab module receives remote changes, the history has
// to know about those, so that it can adjust the steps that were
// rebased on top of the remote changes, and include the position
// maps for the remote changes in its array of items.
Branch.prototype.rebased = function rebased (rebasedTransform, rebasedCount) {
  if (!this.eventCount) { return this }

  var rebasedItems = [], start = Math.max(0, this.items.length - rebasedCount);

  var mapping = rebasedTransform.mapping;
  var newUntil = rebasedTransform.steps.length;
  var eventCount = this.eventCount;
  this.items.forEach(function (item) { if (item.selection) { eventCount--; } }, start);

  var iRebased = rebasedCount;
  this.items.forEach(function (item) {
    var pos = mapping.getMirror(--iRebased);
    if (pos == null) { return }
    newUntil = Math.min(newUntil, pos);
    var map = mapping.maps[pos];
    if (item.step) {
      var step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos]);
      var selection = item.selection && item.selection.map(mapping.slice(iRebased + 1, pos));
      if (selection) { eventCount++; }
      rebasedItems.push(new Item(map, step, selection));
    } else {
      rebasedItems.push(new Item(map));
    }
  }, start);

  var newMaps = [];
  for (var i = rebasedCount; i < newUntil; i++)
    { newMaps.push(new Item(mapping.maps[i])); }
  var items = this.items.slice(0, start).append(newMaps).append(rebasedItems);
  var branch = new Branch(items, eventCount);

  if (branch.emptyItemCount() > max_empty_items)
    { branch = branch.compress(this.items.length - rebasedItems.length); }
  return branch
};

Branch.prototype.emptyItemCount = function emptyItemCount () {
  var count = 0;
  this.items.forEach(function (item) { if (!item.step) { count++; } });
  return count
};

// Compressing a branch means rewriting it to push the air (map-only
// items) out. During collaboration, these naturally accumulate
// because each remote change adds one. The `upto` argument is used
// to ensure that only the items below a given level are compressed,
// because `rebased` relies on a clean, untouched set of items in
// order to associate old items with rebased steps.
Branch.prototype.compress = function compress (upto) {
    if ( upto === void 0 ) upto = this.items.length;

  var remap = this.remapping(0, upto), mapFrom = remap.maps.length;
  var items = [], events = 0;
  this.items.forEach(function (item, i) {
    if (i >= upto) {
      items.push(item);
      if (item.selection) { events++; }
    } else if (item.step) {
      var step = item.step.map(remap.slice(mapFrom)), map = step && step.getMap();
      mapFrom--;
      if (map) { remap.appendMap(map, mapFrom); }
      if (step) {
        var selection = item.selection && item.selection.map(remap.slice(mapFrom));
        if (selection) { events++; }
        var newItem = new Item(map.invert(), step, selection), merged, last = items.length - 1;
        if (merged = items.length && items[last].merge(newItem))
          { items[last] = merged; }
        else
          { items.push(newItem); }
      }
    } else if (item.map) {
      mapFrom--;
    }
  }, this.items.length, 0);
  return new Branch(RopeSequence.from(items.reverse()), events)
};

Branch.empty = new Branch(RopeSequence.empty, 0);

function cutOffEvents(items, n) {
  var cutPoint;
  items.forEach(function (item, i) {
    if (item.selection && (n-- == 0)) {
      cutPoint = i;
      return false
    }
  });
  return items.slice(cutPoint)
}

var Item = function Item(map, step, selection, mirrorOffset) {
  this.map = map;
  this.step = step;
  this.selection = selection;
  this.mirrorOffset = mirrorOffset;
};

Item.prototype.merge = function merge (other) {
  if (this.step && other.step && !other.selection) {
    var step = other.step.merge(this.step);
    if (step) { return new Item(step.getMap().invert(), step, this.selection) }
  }
};

// The value of the state field that tracks undo/redo history for that
// state. Will be stored in the plugin state when the history plugin
// is active.
var HistoryState = function HistoryState(done, undone, prevRanges, prevTime) {
  this.done = done;
  this.undone = undone;
  this.prevRanges = prevRanges;
  this.prevTime = prevTime;
};

var DEPTH_OVERFLOW = 20;

// : (HistoryState, EditorState, Transaction, Object)
// Record a transformation in undo history.
function applyTransaction(history, state, tr, options) {
  var historyTr = tr.getMeta(historyKey), rebased;
  if (historyTr) { return historyTr.historyState }

  if (tr.getMeta(closeHistoryKey)) { history = new HistoryState(history.done, history.undone, null, 0); }

  var appended = tr.getMeta("appendedTransaction");

  if (tr.steps.length == 0) {
    return history
  } else if (appended && appended.getMeta(historyKey)) {
    if (appended.getMeta(historyKey).redo)
      { return new HistoryState(history.done.addTransform(tr, null, options, mustPreserveItems(state)),
                              history.undone, rangesFor(tr.mapping.maps[tr.steps.length - 1]), history.prevTime) }
    else
      { return new HistoryState(history.done, history.undone.addTransform(tr, null, options, mustPreserveItems(state)),
                              null, history.prevTime) }
  } else if (tr.getMeta("addToHistory") !== false && !(appended && appended.getMeta("addToHistory") === false)) {
    // Group transforms that occur in quick succession into one event.
    var newGroup = history.prevTime < (tr.time || 0) - options.newGroupDelay ||
        !appended && !isAdjacentTo(tr, history.prevRanges);
    var prevRanges = appended ? mapRanges(history.prevRanges, tr.mapping) : rangesFor(tr.mapping.maps[tr.steps.length - 1]);
    return new HistoryState(history.done.addTransform(tr, newGroup ? state.selection.getBookmark() : null,
                                                      options, mustPreserveItems(state)),
                            Branch.empty, prevRanges, tr.time)
  } else if (rebased = tr.getMeta("rebased")) {
    // Used by the collab module to tell the history that some of its
    // content has been rebased.
    return new HistoryState(history.done.rebased(tr, rebased),
                            history.undone.rebased(tr, rebased),
                            mapRanges(history.prevRanges, tr.mapping), history.prevTime)
  } else {
    return new HistoryState(history.done.addMaps(tr.mapping.maps),
                            history.undone.addMaps(tr.mapping.maps),
                            mapRanges(history.prevRanges, tr.mapping), history.prevTime)
  }
}

function isAdjacentTo(transform, prevRanges) {
  if (!prevRanges) { return false }
  if (!transform.docChanged) { return true }
  var adjacent = false;
  transform.mapping.maps[0].forEach(function (start, end) {
    for (var i = 0; i < prevRanges.length; i += 2)
      { if (start <= prevRanges[i + 1] && end >= prevRanges[i])
        { adjacent = true; } }
  });
  return adjacent
}

function rangesFor(map) {
  var result = [];
  map.forEach(function (_from, _to, from, to) { return result.push(from, to); });
  return result
}

function mapRanges(ranges, mapping) {
  if (!ranges) { return null }
  var result = [];
  for (var i = 0; i < ranges.length; i += 2) {
    var from = mapping.map(ranges[i], 1), to = mapping.map(ranges[i + 1], -1);
    if (from <= to) { result.push(from, to); }
  }
  return result
}

// : (HistoryState, EditorState, (tr: Transaction), bool)
// Apply the latest event from one branch to the document and shift the event
// onto the other branch.
function histTransaction(history, state, dispatch, redo) {
  var preserveItems = mustPreserveItems(state), histOptions = historyKey.get(state).spec.config;
  var pop = (redo ? history.undone : history.done).popEvent(state, preserveItems);
  if (!pop) { return }

  var selection = pop.selection.resolve(pop.transform.doc);
  var added = (redo ? history.done : history.undone).addTransform(pop.transform, state.selection.getBookmark(),
                                                                  histOptions, preserveItems);

  var newHist = new HistoryState(redo ? added : pop.remaining, redo ? pop.remaining : added, null, 0);
  dispatch(pop.transform.setSelection(selection).setMeta(historyKey, {redo: redo, historyState: newHist}).scrollIntoView());
}

var cachedPreserveItems = false;
var cachedPreserveItemsPlugins = null;
// Check whether any plugin in the given state has a
// `historyPreserveItems` property in its spec, in which case we must
// preserve steps exactly as they came in, so that they can be
// rebased.
function mustPreserveItems(state) {
  var plugins = state.plugins;
  if (cachedPreserveItemsPlugins != plugins) {
    cachedPreserveItems = false;
    cachedPreserveItemsPlugins = plugins;
    for (var i = 0; i < plugins.length; i++) { if (plugins[i].spec.historyPreserveItems) {
      cachedPreserveItems = true;
      break
    } }
  }
  return cachedPreserveItems
}

// :: (Transaction) → Transaction
// Set a flag on the given transaction that will prevent further steps
// from being appended to an existing history event (so that they
// require a separate undo command to undo).
function closeHistory(tr) {
  return tr.setMeta(closeHistoryKey, true)
}

var historyKey = new prosemirrorState.PluginKey("history");
var closeHistoryKey = new prosemirrorState.PluginKey("closeHistory");

// :: (?Object) → Plugin
// Returns a plugin that enables the undo history for an editor. The
// plugin will track undo and redo stacks, which can be used with the
// [`undo`](#history.undo) and [`redo`](#history.redo) commands.
//
// You can set an `"addToHistory"` [metadata
// property](#state.Transaction.setMeta) of `false` on a transaction
// to prevent it from being rolled back by undo.
//
//   config::-
//   Supports the following configuration options:
//
//     depth:: ?number
//     The amount of history events that are collected before the
//     oldest events are discarded. Defaults to 100.
//
//     newGroupDelay:: ?number
//     The delay between changes after which a new group should be
//     started. Defaults to 500 (milliseconds). Note that when changes
//     aren't adjacent, a new group is always started.
function history(config) {
  config = {depth: config && config.depth || 100,
            newGroupDelay: config && config.newGroupDelay || 500};
  return new prosemirrorState.Plugin({
    key: historyKey,

    state: {
      init: function init() {
        return new HistoryState(Branch.empty, Branch.empty, null, 0)
      },
      apply: function apply(tr, hist, state) {
        return applyTransaction(hist, state, tr, config)
      }
    },

    config: config
  })
}

// :: (EditorState, ?(tr: Transaction)) → bool
// A command function that undoes the last change, if any.
function undo(state, dispatch) {
  var hist = historyKey.getState(state);
  if (!hist || hist.done.eventCount == 0) { return false }
  if (dispatch) { histTransaction(hist, state, dispatch, false); }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// A command function that redoes the last undone change, if any.
function redo(state, dispatch) {
  var hist = historyKey.getState(state);
  if (!hist || hist.undone.eventCount == 0) { return false }
  if (dispatch) { histTransaction(hist, state, dispatch, true); }
  return true
}

// :: (EditorState) → number
// The amount of undoable events available in a given state.
function undoDepth(state) {
  var hist = historyKey.getState(state);
  return hist ? hist.done.eventCount : 0
}

// :: (EditorState) → number
// The amount of redoable events available in a given editor state.
function redoDepth(state) {
  var hist = historyKey.getState(state);
  return hist ? hist.undone.eventCount : 0
}

exports.HistoryState = HistoryState;
exports.closeHistory = closeHistory;
exports.history = history;
exports.undo = undo;
exports.redo = redo;
exports.undoDepth = undoDepth;
exports.redoDepth = redoDepth;
//# sourceMappingURL=history.js.map

},{"rope-sequence":"../node_modules/rope-sequence/dist/index.js","prosemirror-transform":"../node_modules/prosemirror-transform/dist/index.js","prosemirror-state":"../node_modules/prosemirror-state/dist/index.js"}],"components/ProseMirror/Keymaps/Code.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _prosemirrorHistory = require("prosemirror-history");

function _default(props) {
  var trigger = function trigger(event) {
    if (props[event]) {
      props[event]();
    }
  };

  var onEnter = function onEnter() {
    trigger("onEnter");
  };

  var onShiftEnter = function onShiftEnter() {
    trigger("onShiftEnter");
  };

  var onTab = function onTab() {
    trigger("onTab");
    return true;
  };

  var onShiftTab = function onShiftTab() {
    trigger("onShiftTab");
    return true;
  };

  return {
    "Cmd-z": _prosemirrorHistory.undo,
    "Cmd-Shift-z": _prosemirrorHistory.redo,
    "Enter": onEnter,
    "Shift-Enter": onShiftEnter,
    "Shift-Tab": onShiftTab,
    "Tab": onTab
  };
}

;
},{"prosemirror-history":"../node_modules/prosemirror-history/dist/history.js"}],"components/ProseMirror/Keymaps/Default.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _prosemirrorHistory = require("prosemirror-history");

function _default(props) {
  var trigger = function trigger(event) {
    if (props[event]) {
      props[event]();
    }
  };

  var onBold = function onBold() {
    trigger("onBold");
  };

  var onDelete = function onDelete(state) {
    var $cursor = state.selection.$cursor;

    if (!$cursor || $cursor.pos !== 0) {
      return false;
    }

    trigger("onBack");
  };

  var onDown = function onDown(state, dispatch, view) {
    if (view.endOfTextblock("down", state)) {
      trigger("onNext");
      return true;
    }
  };

  var onEnter = function onEnter(state, dispatch, view) {
    var $cursor = state.selection.$cursor;

    if (!$cursor || !view.endOfTextblock("forward", state)) {
      trigger("onSplit");
    } else {
      trigger("onEnter");
    }
  };

  var onItalic = function onItalic() {
    trigger("onItalic");
  };

  var onShiftEnter = function onShiftEnter() {
    trigger("onShiftEnter");
  };

  var onShiftTab = function onShiftTab() {
    trigger("onShiftTab");
    return true;
  };

  var onStrikeThrough = function onStrikeThrough() {
    trigger("onStrikeThrough");
  };

  var onTab = function onTab() {
    trigger("onTab");
    return true;
  };

  var onUnderline = function onUnderline() {
    trigger("onUnderline");
  };

  var onUp = function onUp(state, dispatch, view) {
    if (view.endOfTextblock("up", state)) {
      trigger("onPrev");
      return true;
    }
  };

  return {
    "ArrowUp": onUp,
    "ArrowDown": onDown,
    "Backspace": onDelete,
    "Cmd-b": onBold,
    "Cmd-i": onItalic,
    "Cmd-u": onUnderline,
    "Cmd-z": _prosemirrorHistory.undo,
    "Cmd-Shift-s": onStrikeThrough,
    "Cmd-Shift-z": _prosemirrorHistory.redo,
    "Delete": onDelete,
    "Enter": onEnter,
    "Mod-Delete": onDelete,
    "Shift-Enter": onShiftEnter,
    "Shift-Tab": onShiftTab,
    "Tab": onTab
  };
}

;
},{"prosemirror-history":"../node_modules/prosemirror-history/dist/history.js"}],"components/ProseMirror/Editor/Keymap.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _Code = _interopRequireDefault(require("../Keymaps/Code.js"));

var _Default = _interopRequireDefault(require("../Keymaps/Default.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Keymaps */
function _default(props) {
  return props.code === true ? (0, _Code.default)(props) : (0, _Default.default)(props);
}

;
},{"../Keymaps/Code.js":"components/ProseMirror/Keymaps/Code.js","../Keymaps/Default.js":"components/ProseMirror/Keymaps/Default.js"}],"components/ProseMirror/Schemas/Code.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _prosemirrorModel = require("prosemirror-model");

function _default() {
  return new _prosemirrorModel.Schema({
    nodes: {
      text: {},
      doc: {
        content: "code"
      },
      code: {
        content: "text*",
        marks: "",
        code: true,
        defining: true,
        parseDOM: [{
          tag: "pre",
          preserveWhitespace: "full"
        }],
        toDOM: function toDOM() {
          return ["pre", ["code", 0]];
        }
      }
    }
  });
}

;
},{"prosemirror-model":"../node_modules/prosemirror-model/dist/index.js"}],"components/ProseMirror/Marks/Code.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  toolbar: {
    icon: "code",
    label: "Code",
    action: "toggleMark",
    args: ["code"]
  },
  parseDOM: [{
    tag: "code"
  }],
  toDOM: function toDOM() {
    return ["code", 0];
  }
};
exports.default = _default;
},{}],"components/ProseMirror/Marks/Bold.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  toolbar: {
    icon: "bold",
    label: "Bold",
    action: "toggleMark",
    args: ["bold"]
  },
  parseDOM: [{
    tag: "strong"
  }, {
    tag: "b",
    getAttrs: function getAttrs(node) {
      return node.style.fontWeight != "normal" && null;
    }
  }, {
    style: "font-weight",
    getAttrs: function getAttrs(value) {
      return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null;
    }
  }],
  toDOM: function toDOM() {
    return ["strong", 0];
  }
};
exports.default = _default;
},{}],"components/ProseMirror/Marks/Italic.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  toolbar: {
    icon: "italic",
    label: "Italic",
    action: "toggleMark",
    args: ["italic"]
  },
  parseDOM: [{
    tag: "i"
  }, {
    tag: "em"
  }, {
    style: "font-style=italic"
  }],
  toDOM: function toDOM() {
    return ["em", 0];
  }
};
exports.default = _default;
},{}],"components/ProseMirror/Marks/Link.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  toolbar: {
    icon: "url",
    label: "Link",
    action: "link"
  },
  attrs: {
    href: {},
    title: {
      default: null
    }
  },
  inclusive: false,
  parseDOM: [{
    tag: "a[href]",
    getAttrs: function getAttrs(dom) {
      return {
        href: dom.getAttribute("href"),
        title: dom.getAttribute("title")
      };
    }
  }],
  toDOM: function toDOM(node) {
    var _node$attrs = node.attrs,
        href = _node$attrs.href,
        title = _node$attrs.title;
    return ["a", {
      href: href,
      title: title
    }, 0];
  }
};
exports.default = _default;
},{}],"components/ProseMirror/Marks/StrikeThrough.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  toolbar: {
    icon: "s",
    label: "Strike-through",
    action: "toggleMark",
    args: ["strikeThrough"]
  },
  parseDOM: [{
    tag: "del"
  }, {
    style: "text-decoration=line-through"
  }],
  toDOM: function toDOM() {
    return ["del", 0];
  }
};
exports.default = _default;
},{}],"components/ProseMirror/Marks/Underline.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  toolbar: {
    icon: "u",
    label: "Underline",
    action: "toggleMark",
    args: ["underline"]
  },
  parseDOM: [{
    tag: "u"
  }, {
    style: "text-decoration=underline"
  }],
  toDOM: function toDOM() {
    return ["u", 0];
  }
};
exports.default = _default;
},{}],"components/ProseMirror/Schemas/Default.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _prosemirrorModel = require("prosemirror-model");

var _Code = _interopRequireDefault(require("../Marks/Code.js"));

var _Bold = _interopRequireDefault(require("../Marks/Bold.js"));

var _Italic = _interopRequireDefault(require("../Marks/Italic.js"));

var _Link = _interopRequireDefault(require("../Marks/Link.js"));

var _StrikeThrough = _interopRequireDefault(require("../Marks/StrikeThrough.js"));

var _Underline = _interopRequireDefault(require("../Marks/Underline.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Marks */
function _default(marks) {
  var availableMarks = {
    code: _Code.default,
    bold: _Bold.default,
    italic: _Italic.default,
    link: _Link.default,
    underline: _Underline.default,
    strikeThrough: _StrikeThrough.default
  };
  var allowedMarks = {};
  marks.forEach(function (mark) {
    allowedMarks[mark] = availableMarks[mark];
  });
  return new _prosemirrorModel.Schema({
    nodes: {
      text: {},
      doc: {
        content: "(text | hard_break )*"
      },
      hard_break: {
        inline: true,
        group: "inline",
        selectable: false,
        parseDOM: [{
          tag: "br"
        }],
        toDOM: function toDOM() {
          return ["br"];
        }
      }
    },
    marks: allowedMarks
  });
}

;
},{"prosemirror-model":"../node_modules/prosemirror-model/dist/index.js","../Marks/Code.js":"components/ProseMirror/Marks/Code.js","../Marks/Bold.js":"components/ProseMirror/Marks/Bold.js","../Marks/Italic.js":"components/ProseMirror/Marks/Italic.js","../Marks/Link.js":"components/ProseMirror/Marks/Link.js","../Marks/StrikeThrough.js":"components/ProseMirror/Marks/StrikeThrough.js","../Marks/Underline.js":"components/ProseMirror/Marks/Underline.js"}],"components/ProseMirror/Editor/Schema.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _Code = _interopRequireDefault(require("../Schemas/Code.js"));

var _Default = _interopRequireDefault(require("../Schemas/Default.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Schema */
function _default(marks, code) {
  return code ? (0, _Code.default)() : (0, _Default.default)(marks);
}

;
},{"../Schemas/Code.js":"components/ProseMirror/Schemas/Code.js","../Schemas/Default.js":"components/ProseMirror/Schemas/Default.js"}],"../node_modules/w3c-keyname/index.js":[function(require,module,exports) {
var base = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'",
  229: "q"
}
var shift = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ";",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: "\"",
  229: "Q"
}

var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent)
var safari = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor)
var gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent)
var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform)
var brokenModifierNames = chrome && (mac || +chrome[1] < 57) || gecko && mac

// Fill in the digit keys
for (var i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i)

// The function keys
for (var i = 1; i <= 24; i++) base[i + 111] = "F" + i

// And the alphabetic keys
for (var i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32)
  shift[i] = String.fromCharCode(i)
}

// For each code that doesn't have a shift-equivalent, copy the base name
for (var code in base) if (!shift.hasOwnProperty(code)) shift[code] = base[code]

function keyName(event) {
  // Don't trust event.key in Chrome when there are modifiers until
  // they fix https://bugs.chromium.org/p/chromium/issues/detail?id=633838
  var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) ||
    safari && event.shiftKey && event.key && event.key.length == 1
  var name = (!ignoreKey && event.key) ||
    (event.shiftKey ? shift : base)[event.keyCode] ||
    event.key || "Unidentified"
  // Edge sometimes produces wrong names (Issue #3)
  if (name == "Esc") name = "Escape"
  if (name == "Del") name = "Delete"
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8860571/
  if (name == "Left") name = "ArrowLeft"
  if (name == "Up") name = "ArrowUp"
  if (name == "Right") name = "ArrowRight"
  if (name == "Down") name = "ArrowDown"
  return name
}

module.exports = keyName
keyName.base = base
keyName.shift = shift

},{}],"../node_modules/prosemirror-keymap/dist/keymap.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var keyName = _interopDefault(require('w3c-keyname'));
var prosemirrorState = require('prosemirror-state');

// declare global: navigator

var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false;

function normalizeKeyName(name) {
  var parts = name.split(/-(?!$)/), result = parts[parts.length - 1];
  if (result == "Space") { result = " "; }
  var alt, ctrl, shift, meta;
  for (var i = 0; i < parts.length - 1; i++) {
    var mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod)) { meta = true; }
    else if (/^a(lt)?$/i.test(mod)) { alt = true; }
    else if (/^(c|ctrl|control)$/i.test(mod)) { ctrl = true; }
    else if (/^s(hift)?$/i.test(mod)) { shift = true; }
    else if (/^mod$/i.test(mod)) { if (mac) { meta = true; } else { ctrl = true; } }
    else { throw new Error("Unrecognized modifier name: " + mod) }
  }
  if (alt) { result = "Alt-" + result; }
  if (ctrl) { result = "Ctrl-" + result; }
  if (meta) { result = "Meta-" + result; }
  if (shift) { result = "Shift-" + result; }
  return result
}

function normalize(map) {
  var copy = Object.create(null);
  for (var prop in map) { copy[normalizeKeyName(prop)] = map[prop]; }
  return copy
}

function modifiers(name, event, shift) {
  if (event.altKey) { name = "Alt-" + name; }
  if (event.ctrlKey) { name = "Ctrl-" + name; }
  if (event.metaKey) { name = "Meta-" + name; }
  if (shift !== false && event.shiftKey) { name = "Shift-" + name; }
  return name
}

// :: (Object) → Plugin
// Create a keymap plugin for the given set of bindings.
//
// Bindings should map key names to [command](#commands)-style
// functions, which will be called with `(EditorState, dispatch,
// EditorView)` arguments, and should return true when they've handled
// the key. Note that the view argument isn't part of the command
// protocol, but can be used as an escape hatch if a binding needs to
// directly interact with the UI.
//
// Key names may be strings like `"Shift-Ctrl-Enter"`—a key
// identifier prefixed with zero or more modifiers. Key identifiers
// are based on the strings that can appear in
// [`KeyEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
// Use lowercase letters to refer to letter keys (or uppercase letters
// if you want shift to be held). You may use `"Space"` as an alias
// for the `" "` name.
//
// Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
// `a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
// `Meta-`) are recognized. For characters that are created by holding
// shift, the `Shift-` prefix is implied, and should not be added
// explicitly.
//
// You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
// other platforms.
//
// You can add multiple keymap plugins to an editor. The order in
// which they appear determines their precedence (the ones early in
// the array get to dispatch first).
function keymap(bindings) {
  return new prosemirrorState.Plugin({props: {handleKeyDown: keydownHandler(bindings)}})
}

// :: (Object) → (view: EditorView, event: dom.Event) → bool
// Given a set of bindings (using the same format as
// [`keymap`](#keymap.keymap), return a [keydown
// handler](#view.EditorProps.handleKeyDown) handles them.
function keydownHandler(bindings) {
  var map = normalize(bindings);
  return function(view, event) {
    var name = keyName(event), isChar = name.length == 1 && name != " ", baseName;
    var direct = map[modifiers(name, event, !isChar)];
    if (direct && direct(view.state, view.dispatch, view)) { return true }
    if (isChar && (event.shiftKey || event.altKey || event.metaKey) &&
        (baseName = keyName.base[event.keyCode]) && baseName != name) {
      var fromCode = map[modifiers(baseName, event, true)];
      if (fromCode && fromCode(view.state, view.dispatch, view)) { return true }
    }
    return false
  }
}

exports.keymap = keymap;
exports.keydownHandler = keydownHandler;
//# sourceMappingURL=keymap.js.map

},{"w3c-keyname":"../node_modules/w3c-keyname/index.js","prosemirror-state":"../node_modules/prosemirror-state/dist/index.js"}],"../node_modules/prosemirror-inputrules/dist/index.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var prosemirrorState = require('prosemirror-state');
var prosemirrorTransform = require('prosemirror-transform');

// ::- Input rules are regular expressions describing a piece of text
// that, when typed, causes something to happen. This might be
// changing two dashes into an emdash, wrapping a paragraph starting
// with `"> "` into a blockquote, or something entirely different.
var InputRule = function InputRule(match, handler) {
  this.match = match;
  this.handler = typeof handler == "string" ? stringHandler(handler) : handler;
};

function stringHandler(string) {
  return function(state, match, start, end) {
    var insert = string;
    if (match[1]) {
      var offset = match[0].lastIndexOf(match[1]);
      insert += match[0].slice(offset + match[1].length);
      start += offset;
      var cutOff = start - end;
      if (cutOff > 0) {
        insert = match[0].slice(offset - cutOff, offset) + insert;
        start = end;
      }
    }
    return state.tr.insertText(insert, start, end)
  }
}

var MAX_MATCH = 500;

// :: (config: {rules: [InputRule]}) → Plugin
// Create an input rules plugin. When enabled, it will cause text
// input that matches any of the given rules to trigger the rule's
// action.
function inputRules(ref) {
  var rules = ref.rules;

  var plugin = new prosemirrorState.Plugin({
    state: {
      init: function init() { return null },
      apply: function apply(tr, prev) {
        var stored = tr.getMeta(this);
        if (stored) { return stored }
        return tr.selectionSet || tr.docChanged ? null : prev
      }
    },

    props: {
      handleTextInput: function handleTextInput(view, from, to, text) {
        return run(view, from, to, text, rules, plugin)
      },
      handleDOMEvents: {
        compositionend: function (view) {
          setTimeout(function () {
            var ref = view.state.selection;
            var $cursor = ref.$cursor;
            if ($cursor) { run(view, $cursor.pos, $cursor.pos, "", rules, plugin); }
          });
        }
      }
    },

    isInputRules: true
  });
  return plugin
}

function run(view, from, to, text, rules, plugin) {
  if (view.composing) { return false }
  var state = view.state, $from = state.doc.resolve(from);
  if ($from.parent.type.spec.code) { return false }
  var textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset,
                                            null, "\ufffc") + text;
  for (var i = 0; i < rules.length; i++) {
    var match = rules[i].match.exec(textBefore);
    var tr = match && rules[i].handler(state, match, from - (match[0].length - text.length), to);
    if (!tr) { continue }
    view.dispatch(tr.setMeta(plugin, {transform: tr, from: from, to: to, text: text}));
    return true
  }
  return false
}

// :: (EditorState, ?(Transaction)) → bool
// This is a command that will undo an input rule, if applying such a
// rule was the last thing that the user did.
function undoInputRule(state, dispatch) {
  var plugins = state.plugins;
  for (var i = 0; i < plugins.length; i++) {
    var plugin = plugins[i], undoable = (void 0);
    if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
      if (dispatch) {
        var tr = state.tr, toUndo = undoable.transform;
        for (var j = toUndo.steps.length - 1; j >= 0; j--)
          { tr.step(toUndo.steps[j].invert(toUndo.docs[j])); }
        var marks = tr.doc.resolve(undoable.from).marks();
        dispatch(tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks)));
      }
      return true
    }
  }
  return false
}

// :: InputRule Converts double dashes to an emdash.
var emDash = new InputRule(/--$/, "—");
// :: InputRule Converts three dots to an ellipsis character.
var ellipsis = new InputRule(/\.\.\.$/, "…");
// :: InputRule “Smart” opening double quotes.
var openDoubleQuote = new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/, "“");
// :: InputRule “Smart” closing double quotes.
var closeDoubleQuote = new InputRule(/"$/, "”");
// :: InputRule “Smart” opening single quotes.
var openSingleQuote = new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/, "‘");
// :: InputRule “Smart” closing single quotes.
var closeSingleQuote = new InputRule(/'$/, "’");

// :: [InputRule] Smart-quote related input rules.
var smartQuotes = [openDoubleQuote, closeDoubleQuote, openSingleQuote, closeSingleQuote];

// :: (RegExp, NodeType, ?union<Object, ([string]) → ?Object>, ?([string], Node) → bool) → InputRule
// Build an input rule for automatically wrapping a textblock when a
// given string is typed. The `regexp` argument is
// directly passed through to the `InputRule` constructor. You'll
// probably want the regexp to start with `^`, so that the pattern can
// only occur at the start of a textblock.
//
// `nodeType` is the type of node to wrap in. If it needs attributes,
// you can either pass them directly, or pass a function that will
// compute them from the regular expression match.
//
// By default, if there's a node with the same type above the newly
// wrapped node, the rule will try to [join](#transform.Transform.join) those
// two nodes. You can pass a join predicate, which takes a regular
// expression match and the node before the wrapped node, and can
// return a boolean to indicate whether a join should happen.
function wrappingInputRule(regexp, nodeType, getAttrs, joinPredicate) {
  return new InputRule(regexp, function (state, match, start, end) {
    var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    var tr = state.tr.delete(start, end);
    var $start = tr.doc.resolve(start), range = $start.blockRange(), wrapping = range && prosemirrorTransform.findWrapping(range, nodeType, attrs);
    if (!wrapping) { return null }
    tr.wrap(range, wrapping);
    var before = tr.doc.resolve(start - 1).nodeBefore;
    if (before && before.type == nodeType && prosemirrorTransform.canJoin(tr.doc, start - 1) &&
        (!joinPredicate || joinPredicate(match, before)))
      { tr.join(start - 1); }
    return tr
  })
}

// :: (RegExp, NodeType, ?union<Object, ([string]) → ?Object>) → InputRule
// Build an input rule that changes the type of a textblock when the
// matched text is typed into it. You'll usually want to start your
// regexp with `^` to that it is only matched at the start of a
// textblock. The optional `getAttrs` parameter can be used to compute
// the new node's attributes, and works the same as in the
// `wrappingInputRule` function.
function textblockTypeInputRule(regexp, nodeType, getAttrs) {
  return new InputRule(regexp, function (state, match, start, end) {
    var $start = state.doc.resolve(start);
    var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) { return null }
    return state.tr
      .delete(start, end)
      .setBlockType(start, start, nodeType, attrs)
  })
}

exports.InputRule = InputRule;
exports.inputRules = inputRules;
exports.undoInputRule = undoInputRule;
exports.emDash = emDash;
exports.ellipsis = ellipsis;
exports.openDoubleQuote = openDoubleQuote;
exports.closeDoubleQuote = closeDoubleQuote;
exports.openSingleQuote = openSingleQuote;
exports.closeSingleQuote = closeSingleQuote;
exports.smartQuotes = smartQuotes;
exports.wrappingInputRule = wrappingInputRule;
exports.textblockTypeInputRule = textblockTypeInputRule;
//# sourceMappingURL=index.js.map

},{"prosemirror-state":"../node_modules/prosemirror-state/dist/index.js","prosemirror-transform":"../node_modules/prosemirror-transform/dist/index.js"}],"components/ProseMirror/Editor/State.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _prosemirrorKeymap = require("prosemirror-keymap");

var _prosemirrorHistory = require("prosemirror-history");

var _prosemirrorState = require("prosemirror-state");

var _prosemirrorInputrules = require("prosemirror-inputrules");

var textRule = function textRule(regex, handler) {
  return new _prosemirrorInputrules.InputRule(regex, function (state, match, start, end) {
    handler();
    return state.tr.delete(start, end);
  });
};

function _default(document, keys, props) {
  return _prosemirrorState.EditorState.create({
    doc: document,
    plugins: [(0, _prosemirrorKeymap.keymap)(keys), (0, _prosemirrorHistory.history)(), (0, _prosemirrorInputrules.inputRules)({
      rules: [_prosemirrorInputrules.ellipsis, new _prosemirrorInputrules.InputRule(/\<\-/, "←"), new _prosemirrorInputrules.InputRule(/\-\>/, "→"), new _prosemirrorInputrules.InputRule(/\-\-/, "–"), textRule(/^\–\-/, function () {
        if (props.onConvert) {
          props.onConvert("hr");
        }
      }), textRule(/^\s*([-+*])\s$/, function () {
        if (props.onConvert) {
          props.onConvert("ul");
        }
      }), textRule(/^\d{1,}\.\s$/, function () {
        if (props.onConvert) {
          props.onConvert("ol");
        }
      }), textRule(/^```$/, function () {
        if (props.onConvert) {
          props.onConvert("code");
        }
      }), textRule(/^\>\s$/, function () {
        if (props.onConvert) {
          props.onConvert("blockquote");
        }
      }), textRule(/^\#\s$/, function () {
        if (props.onConvert) {
          props.onConvert("h1");
        }
      }), textRule(/^\#\#\s$/, function () {
        if (props.onConvert) {
          props.onConvert("h2");
        }
      }), textRule(/^\#\#\#\s$/, function () {
        if (props.onConvert) {
          props.onConvert("h3");
        }
      })]
    })]
  });
}

;
},{"prosemirror-keymap":"../node_modules/prosemirror-keymap/dist/keymap.js","prosemirror-history":"../node_modules/prosemirror-history/dist/history.js","prosemirror-state":"../node_modules/prosemirror-state/dist/index.js","prosemirror-inputrules":"../node_modules/prosemirror-inputrules/dist/index.js"}],"components/ProseMirror/Editor/View.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _prosemirrorView = require("prosemirror-view");

var _Document = _interopRequireDefault(require("./Document.js"));

var _Keymap = _interopRequireDefault(require("./Keymap.js"));

var _Schema = _interopRequireDefault(require("./Schema.js"));

var _State = _interopRequireDefault(require("./State.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(props) {
  var schema = (0, _Schema.default)(props.marks, props.code);
  var document = (0, _Document.default)(schema, props.content, props.code);
  var keymap = (0, _Keymap.default)(props);
  var state = (0, _State.default)(document, keymap, props);
  return new _prosemirrorView.EditorView(props.element, {
    state: state,
    dispatchTransaction: function dispatchTransaction(transaction) {
      var lastState = this.state;
      var nextState = this.state.apply(transaction);
      this.updateState(nextState);

      if (props.onUpdate && (!lastState || !lastState.doc.eq(this.state.doc))) {
        props.onUpdate();
      }

      if (!props.onSelect) {
        return;
      } // Don't do anything if the document/selection didn't change


      if (lastState && lastState.doc.eq(this.state.doc) && lastState.selection.eq(this.state.selection)) {
        return;
      }

      props.onSelect();
    },
    handlePaste: function handlePaste(view, event, slice) {
      var html = event.clipboardData.getData('text/html');
      var text = event.clipboardData.getData('text/plain');

      if (html.length === 0) {
        return false;
      }

      if (props.onPaste) {
        result = props.onPaste(html, text);
      }

      return true;
    }
  });
}

;
},{"prosemirror-view":"../node_modules/prosemirror-view/dist/index.js","./Document.js":"components/ProseMirror/Editor/Document.js","./Keymap.js":"components/ProseMirror/Editor/Keymap.js","./Schema.js":"components/ProseMirror/Editor/Schema.js","./State.js":"components/ProseMirror/Editor/State.js"}],"../node_modules/prosemirror-commands/dist/commands.js":[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var prosemirrorTransform = require('prosemirror-transform');
var prosemirrorModel = require('prosemirror-model');
var prosemirrorState = require('prosemirror-state');

// :: (EditorState, ?(tr: Transaction)) → bool
// Delete the selection, if there is one.
function deleteSelection(state, dispatch) {
  if (state.selection.empty) { return false }
  if (dispatch) { dispatch(state.tr.deleteSelection().scrollIntoView()); }
  return true
}

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// If the selection is empty and at the start of a textblock, try to
// reduce the distance between that block and the one before it—if
// there's a block directly before it that can be joined, join them.
// If not, try to move the selected block closer to the next one in
// the document structure by lifting it out of its parent or moving it
// into a parent of the previous block. Will use the view for accurate
// (bidi-aware) start-of-textblock detection if given.
function joinBackward(state, dispatch, view) {
  var ref = state.selection;
  var $cursor = ref.$cursor;
  if (!$cursor || (view ? !view.endOfTextblock("backward", state)
                        : $cursor.parentOffset > 0))
    { return false }

  var $cut = findCutBefore($cursor);

  // If there is no node before this, try to lift
  if (!$cut) {
    var range = $cursor.blockRange(), target = range && prosemirrorTransform.liftTarget(range);
    if (target == null) { return false }
    if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()); }
    return true
  }

  var before = $cut.nodeBefore;
  // Apply the joining algorithm
  if (!before.type.spec.isolating && deleteBarrier(state, $cut, dispatch))
    { return true }

  // If the node below has no content and the node above is
  // selectable, delete the node below and select the one above.
  if ($cursor.parent.content.size == 0 &&
      (textblockAt(before, "end") || prosemirrorState.NodeSelection.isSelectable(before))) {
    if (dispatch) {
      var tr = state.tr.deleteRange($cursor.before(), $cursor.after());
      tr.setSelection(textblockAt(before, "end") ? prosemirrorState.Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1)
                      : prosemirrorState.NodeSelection.create(tr.doc, $cut.pos - before.nodeSize));
      dispatch(tr.scrollIntoView());
    }
    return true
  }

  // If the node before is an atom, delete it
  if (before.isAtom && $cut.depth == $cursor.depth - 1) {
    if (dispatch) { dispatch(state.tr.delete($cut.pos - before.nodeSize, $cut.pos).scrollIntoView()); }
    return true
  }

  return false
}

function textblockAt(node, side) {
  for (; node; node = (side == "start" ? node.firstChild : node.lastChild))
    { if (node.isTextblock) { return true } }
  return false
}

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// When the selection is empty and at the start of a textblock, select
// the node before that textblock, if possible. This is intended to be
// bound to keys like backspace, after
// [`joinBackward`](#commands.joinBackward) or other deleting
// commands, as a fall-back behavior when the schema doesn't allow
// deletion at the selected point.
function selectNodeBackward(state, dispatch, view) {
  var ref = state.selection;
  var $cursor = ref.$cursor;
  if (!$cursor || (view ? !view.endOfTextblock("backward", state)
                        : $cursor.parentOffset > 0))
    { return false }

  var $cut = findCutBefore($cursor), node = $cut && $cut.nodeBefore;
  if (!node || !prosemirrorState.NodeSelection.isSelectable(node)) { return false }
  if (dispatch)
    { dispatch(state.tr.setSelection(prosemirrorState.NodeSelection.create(state.doc, $cut.pos - node.nodeSize)).scrollIntoView()); }
  return true
}

function findCutBefore($pos) {
  if (!$pos.parent.type.spec.isolating) { for (var i = $pos.depth - 1; i >= 0; i--) {
    if ($pos.index(i) > 0) { return $pos.doc.resolve($pos.before(i + 1)) }
    if ($pos.node(i).type.spec.isolating) { break }
  } }
  return null
}

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// If the selection is empty and the cursor is at the end of a
// textblock, try to reduce or remove the boundary between that block
// and the one after it, either by joining them or by moving the other
// block closer to this one in the tree structure. Will use the view
// for accurate start-of-textblock detection if given.
function joinForward(state, dispatch, view) {
  var ref = state.selection;
  var $cursor = ref.$cursor;
  if (!$cursor || (view ? !view.endOfTextblock("forward", state)
                        : $cursor.parentOffset < $cursor.parent.content.size))
    { return false }

  var $cut = findCutAfter($cursor);

  // If there is no node after this, there's nothing to do
  if (!$cut) { return false }

  var after = $cut.nodeAfter;
  // Try the joining algorithm
  if (deleteBarrier(state, $cut, dispatch)) { return true }

  // If the node above has no content and the node below is
  // selectable, delete the node above and select the one below.
  if ($cursor.parent.content.size == 0 &&
      (textblockAt(after, "start") || prosemirrorState.NodeSelection.isSelectable(after))) {
    if (dispatch) {
      var tr = state.tr.deleteRange($cursor.before(), $cursor.after());
      tr.setSelection(textblockAt(after, "start") ? prosemirrorState.Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos)), 1)
                      : prosemirrorState.NodeSelection.create(tr.doc, tr.mapping.map($cut.pos)));
      dispatch(tr.scrollIntoView());
    }
    return true
  }

  // If the next node is an atom, delete it
  if (after.isAtom && $cut.depth == $cursor.depth - 1) {
    if (dispatch) { dispatch(state.tr.delete($cut.pos, $cut.pos + after.nodeSize).scrollIntoView()); }
    return true
  }

  return false
}

// :: (EditorState, ?(tr: Transaction), ?EditorView) → bool
// When the selection is empty and at the end of a textblock, select
// the node coming after that textblock, if possible. This is intended
// to be bound to keys like delete, after
// [`joinForward`](#commands.joinForward) and similar deleting
// commands, to provide a fall-back behavior when the schema doesn't
// allow deletion at the selected point.
function selectNodeForward(state, dispatch, view) {
  var ref = state.selection;
  var $cursor = ref.$cursor;
  if (!$cursor || (view ? !view.endOfTextblock("forward", state)
                        : $cursor.parentOffset < $cursor.parent.content.size))
    { return false }

  var $cut = findCutAfter($cursor), node = $cut && $cut.nodeAfter;
  if (!node || !prosemirrorState.NodeSelection.isSelectable(node)) { return false }
  if (dispatch)
    { dispatch(state.tr.setSelection(prosemirrorState.NodeSelection.create(state.doc, $cut.pos)).scrollIntoView()); }
  return true
}

function findCutAfter($pos) {
  if (!$pos.parent.type.spec.isolating) { for (var i = $pos.depth - 1; i >= 0; i--) {
    var parent = $pos.node(i);
    if ($pos.index(i) + 1 < parent.childCount) { return $pos.doc.resolve($pos.after(i + 1)) }
    if (parent.type.spec.isolating) { break }
  } }
  return null
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Join the selected block or, if there is a text selection, the
// closest ancestor block of the selection that can be joined, with
// the sibling above it.
function joinUp(state, dispatch) {
  var sel = state.selection, nodeSel = sel instanceof prosemirrorState.NodeSelection, point;
  if (nodeSel) {
    if (sel.node.isTextblock || !prosemirrorTransform.canJoin(state.doc, sel.from)) { return false }
    point = sel.from;
  } else {
    point = prosemirrorTransform.joinPoint(state.doc, sel.from, -1);
    if (point == null) { return false }
  }
  if (dispatch) {
    var tr = state.tr.join(point);
    if (nodeSel) { tr.setSelection(prosemirrorState.NodeSelection.create(tr.doc, point - state.doc.resolve(point).nodeBefore.nodeSize)); }
    dispatch(tr.scrollIntoView());
  }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Join the selected block, or the closest ancestor of the selection
// that can be joined, with the sibling after it.
function joinDown(state, dispatch) {
  var sel = state.selection, point;
  if (sel instanceof prosemirrorState.NodeSelection) {
    if (sel.node.isTextblock || !prosemirrorTransform.canJoin(state.doc, sel.to)) { return false }
    point = sel.to;
  } else {
    point = prosemirrorTransform.joinPoint(state.doc, sel.to, 1);
    if (point == null) { return false }
  }
  if (dispatch)
    { dispatch(state.tr.join(point).scrollIntoView()); }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Lift the selected block, or the closest ancestor block of the
// selection that can be lifted, out of its parent node.
function lift(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  var range = $from.blockRange($to), target = range && prosemirrorTransform.liftTarget(range);
  if (target == null) { return false }
  if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()); }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If the selection is in a node whose type has a truthy
// [`code`](#model.NodeSpec.code) property in its spec, replace the
// selection with a newline character.
function newlineInCode(state, dispatch) {
  var ref = state.selection;
  var $head = ref.$head;
  var $anchor = ref.$anchor;
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) { return false }
  if (dispatch) { dispatch(state.tr.insertText("\n").scrollIntoView()); }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// When the selection is in a node with a truthy
// [`code`](#model.NodeSpec.code) property in its spec, create a
// default block after the code block, and move the cursor there.
function exitCode(state, dispatch) {
  var ref = state.selection;
  var $head = ref.$head;
  var $anchor = ref.$anchor;
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) { return false }
  var above = $head.node(-1), after = $head.indexAfter(-1), type = above.contentMatchAt(after).defaultType;
  if (!above.canReplaceWith(after, after, type)) { return false }
  if (dispatch) {
    var pos = $head.after(), tr = state.tr.replaceWith(pos, pos, type.createAndFill());
    tr.setSelection(prosemirrorState.Selection.near(tr.doc.resolve(pos), 1));
    dispatch(tr.scrollIntoView());
  }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If a block node is selected, create an empty paragraph before (if
// it is its parent's first child) or after it.
function createParagraphNear(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  if ($from.parent.inlineContent || $to.parent.inlineContent) { return false }
  var type = $from.parent.contentMatchAt($to.indexAfter()).defaultType;
  if (!type || !type.isTextblock) { return false }
  if (dispatch) {
    var side = (!$from.parentOffset && $to.index() < $to.parent.childCount ? $from : $to).pos;
    var tr = state.tr.insert(side, type.createAndFill());
    tr.setSelection(prosemirrorState.TextSelection.create(tr.doc, side + 1));
    dispatch(tr.scrollIntoView());
  }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// If the cursor is in an empty textblock that can be lifted, lift the
// block.
function liftEmptyBlock(state, dispatch) {
  var ref = state.selection;
  var $cursor = ref.$cursor;
  if (!$cursor || $cursor.parent.content.size) { return false }
  if ($cursor.depth > 1 && $cursor.after() != $cursor.end(-1)) {
    var before = $cursor.before();
    if (prosemirrorTransform.canSplit(state.doc, before)) {
      if (dispatch) { dispatch(state.tr.split(before).scrollIntoView()); }
      return true
    }
  }
  var range = $cursor.blockRange(), target = range && prosemirrorTransform.liftTarget(range);
  if (target == null) { return false }
  if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()); }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Split the parent block of the selection. If the selection is a text
// selection, also delete its content.
function splitBlock(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var $to = ref.$to;
  if (state.selection instanceof prosemirrorState.NodeSelection && state.selection.node.isBlock) {
    if (!$from.parentOffset || !prosemirrorTransform.canSplit(state.doc, $from.pos)) { return false }
    if (dispatch) { dispatch(state.tr.split($from.pos).scrollIntoView()); }
    return true
  }

  if (!$from.parent.isBlock) { return false }

  if (dispatch) {
    var atEnd = $to.parentOffset == $to.parent.content.size;
    var tr = state.tr;
    if (state.selection instanceof prosemirrorState.TextSelection) { tr.deleteSelection(); }
    var deflt = $from.depth == 0 ? null : $from.node(-1).contentMatchAt($from.indexAfter(-1)).defaultType;
    var types = atEnd && deflt ? [{type: deflt}] : null;
    var can = prosemirrorTransform.canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
    if (!types && !can && prosemirrorTransform.canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{type: deflt}])) {
      types = [{type: deflt}];
      can = true;
    }
    if (can) {
      tr.split(tr.mapping.map($from.pos), 1, types);
      if (!atEnd && !$from.parentOffset && $from.parent.type != deflt &&
          $from.node(-1).canReplace($from.index(-1), $from.indexAfter(-1), prosemirrorModel.Fragment.from(deflt.create(), $from.parent)))
        { tr.setNodeMarkup(tr.mapping.map($from.before()), deflt); }
    }
    dispatch(tr.scrollIntoView());
  }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Acts like [`splitBlock`](#commands.splitBlock), but without
// resetting the set of active marks at the cursor.
function splitBlockKeepMarks(state, dispatch) {
  return splitBlock(state, dispatch && (function (tr) {
    var marks = state.storedMarks || (state.selection.$to.parentOffset && state.selection.$from.marks());
    if (marks) { tr.ensureMarks(marks); }
    dispatch(tr);
  }))
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Move the selection to the node wrapping the current selection, if
// any. (Will not select the document node.)
function selectParentNode(state, dispatch) {
  var ref = state.selection;
  var $from = ref.$from;
  var to = ref.to;
  var pos;
  var same = $from.sharedDepth(to);
  if (same == 0) { return false }
  pos = $from.before(same);
  if (dispatch) { dispatch(state.tr.setSelection(prosemirrorState.NodeSelection.create(state.doc, pos))); }
  return true
}

// :: (EditorState, ?(tr: Transaction)) → bool
// Select the whole document.
function selectAll(state, dispatch) {
  if (dispatch) { dispatch(state.tr.setSelection(new prosemirrorState.AllSelection(state.doc))); }
  return true
}

function joinMaybeClear(state, $pos, dispatch) {
  var before = $pos.nodeBefore, after = $pos.nodeAfter, index = $pos.index();
  if (!before || !after || !before.type.compatibleContent(after.type)) { return false }
  if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
    if (dispatch) { dispatch(state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView()); }
    return true
  }
  if (!$pos.parent.canReplace(index, index + 1) || !(after.isTextblock || prosemirrorTransform.canJoin(state.doc, $pos.pos)))
    { return false }
  if (dispatch)
    { dispatch(state.tr
             .clearIncompatible($pos.pos, before.type, before.contentMatchAt(before.childCount))
             .join($pos.pos)
             .scrollIntoView()); }
  return true
}

function deleteBarrier(state, $cut, dispatch) {
  var before = $cut.nodeBefore, after = $cut.nodeAfter, conn, match;
  if (before.type.spec.isolating || after.type.spec.isolating) { return false }
  if (joinMaybeClear(state, $cut, dispatch)) { return true }

  if ($cut.parent.canReplace($cut.index(), $cut.index() + 1) &&
      (conn = (match = before.contentMatchAt(before.childCount)).findWrapping(after.type)) &&
      match.matchType(conn[0] || after.type).validEnd) {
    if (dispatch) {
      var end = $cut.pos + after.nodeSize, wrap = prosemirrorModel.Fragment.empty;
      for (var i = conn.length - 1; i >= 0; i--)
        { wrap = prosemirrorModel.Fragment.from(conn[i].create(null, wrap)); }
      wrap = prosemirrorModel.Fragment.from(before.copy(wrap));
      var tr = state.tr.step(new prosemirrorTransform.ReplaceAroundStep($cut.pos - 1, end, $cut.pos, end, new prosemirrorModel.Slice(wrap, 1, 0), conn.length, true));
      var joinAt = end + 2 * conn.length;
      if (prosemirrorTransform.canJoin(tr.doc, joinAt)) { tr.join(joinAt); }
      dispatch(tr.scrollIntoView());
    }
    return true
  }

  var selAfter = prosemirrorState.Selection.findFrom($cut, 1);
  var range = selAfter && selAfter.$from.blockRange(selAfter.$to), target = range && prosemirrorTransform.liftTarget(range);
  if (target != null && target >= $cut.depth) {
    if (dispatch) { dispatch(state.tr.lift(range, target).scrollIntoView()); }
    return true
  }

  return false
}

// Parameterized commands

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Wrap the selection in a node of the given type with the given
// attributes.
function wrapIn(nodeType, attrs) {
  return function(state, dispatch) {
    var ref = state.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    var range = $from.blockRange($to), wrapping = range && prosemirrorTransform.findWrapping(range, nodeType, attrs);
    if (!wrapping) { return false }
    if (dispatch) { dispatch(state.tr.wrap(range, wrapping).scrollIntoView()); }
    return true
  }
}

// :: (NodeType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Returns a command that tries to set the selected textblocks to the
// given node type with the given attributes.
function setBlockType(nodeType, attrs) {
  return function(state, dispatch) {
    var ref = state.selection;
    var from = ref.from;
    var to = ref.to;
    var applicable = false;
    state.doc.nodesBetween(from, to, function (node, pos) {
      if (applicable) { return false }
      if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) { return }
      if (node.type == nodeType) {
        applicable = true;
      } else {
        var $pos = state.doc.resolve(pos), index = $pos.index();
        applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
      }
    });
    if (!applicable) { return false }
    if (dispatch) { dispatch(state.tr.setBlockType(from, to, nodeType, attrs).scrollIntoView()); }
    return true
  }
}

function markApplies(doc, ranges, type) {
  var loop = function ( i ) {
    var ref = ranges[i];
    var $from = ref.$from;
    var $to = ref.$to;
    var can = $from.depth == 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, function (node) {
      if (can) { return false }
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) { return { v: true } }
  };

  for (var i = 0; i < ranges.length; i++) {
    var returned = loop( i );

    if ( returned ) return returned.v;
  }
  return false
}

// :: (MarkType, ?Object) → (state: EditorState, dispatch: ?(tr: Transaction)) → bool
// Create a command function that toggles the given mark with the
// given attributes. Will return `false` when the current selection
// doesn't support that mark. This will remove the mark if any marks
// of that type exist in the selection, or add it otherwise. If the
// selection is empty, this applies to the [stored
// marks](#state.EditorState.storedMarks) instead of a range of the
// document.
function toggleMark(markType, attrs) {
  return function(state, dispatch) {
    var ref = state.selection;
    var empty = ref.empty;
    var $cursor = ref.$cursor;
    var ranges = ref.ranges;
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) { return false }
    if (dispatch) {
      if ($cursor) {
        if (markType.isInSet(state.storedMarks || $cursor.marks()))
          { dispatch(state.tr.removeStoredMark(markType)); }
        else
          { dispatch(state.tr.addStoredMark(markType.create(attrs))); }
      } else {
        var has = false, tr = state.tr;
        for (var i = 0; !has && i < ranges.length; i++) {
          var ref$1 = ranges[i];
          var $from = ref$1.$from;
          var $to = ref$1.$to;
          has = state.doc.rangeHasMark($from.pos, $to.pos, markType);
        }
        for (var i$1 = 0; i$1 < ranges.length; i$1++) {
          var ref$2 = ranges[i$1];
          var $from$1 = ref$2.$from;
          var $to$1 = ref$2.$to;
          if (has) { tr.removeMark($from$1.pos, $to$1.pos, markType); }
          else { tr.addMark($from$1.pos, $to$1.pos, markType.create(attrs)); }
        }
        dispatch(tr.scrollIntoView());
      }
    }
    return true
  }
}

function wrapDispatchForJoin(dispatch, isJoinable) {
  return function (tr) {
    if (!tr.isGeneric) { return dispatch(tr) }

    var ranges = [];
    for (var i = 0; i < tr.mapping.maps.length; i++) {
      var map = tr.mapping.maps[i];
      for (var j = 0; j < ranges.length; j++)
        { ranges[j] = map.map(ranges[j]); }
      map.forEach(function (_s, _e, from, to) { return ranges.push(from, to); });
    }

    // Figure out which joinable points exist inside those ranges,
    // by checking all node boundaries in their parent nodes.
    var joinable = [];
    for (var i$1 = 0; i$1 < ranges.length; i$1 += 2) {
      var from = ranges[i$1], to = ranges[i$1 + 1];
      var $from = tr.doc.resolve(from), depth = $from.sharedDepth(to), parent = $from.node(depth);
      for (var index = $from.indexAfter(depth), pos = $from.after(depth + 1); pos <= to; ++index) {
        var after = parent.maybeChild(index);
        if (!after) { break }
        if (index && joinable.indexOf(pos) == -1) {
          var before = parent.child(index - 1);
          if (before.type == after.type && isJoinable(before, after))
            { joinable.push(pos); }
        }
        pos += after.nodeSize;
      }
    }
    // Join the joinable points
    joinable.sort(function (a, b) { return a - b; });
    for (var i$2 = joinable.length - 1; i$2 >= 0; i$2--) {
      if (prosemirrorTransform.canJoin(tr.doc, joinable[i$2])) { tr.join(joinable[i$2]); }
    }
    dispatch(tr);
  }
}

// :: ((state: EditorState, ?(tr: Transaction)) → bool, union<(before: Node, after: Node) → bool, [string]>) → (state: EditorState, ?(tr: Transaction)) → bool
// Wrap a command so that, when it produces a transform that causes
// two joinable nodes to end up next to each other, those are joined.
// Nodes are considered joinable when they are of the same type and
// when the `isJoinable` predicate returns true for them or, if an
// array of strings was passed, if their node type name is in that
// array.
function autoJoin(command, isJoinable) {
  if (Array.isArray(isJoinable)) {
    var types = isJoinable;
    isJoinable = function (node) { return types.indexOf(node.type.name) > -1; };
  }
  return function (state, dispatch) { return command(state, dispatch && wrapDispatchForJoin(dispatch, isJoinable)); }
}

// :: (...[(EditorState, ?(tr: Transaction), ?EditorView) → bool]) → (EditorState, ?(tr: Transaction), ?EditorView) → bool
// Combine a number of command functions into a single function (which
// calls them one by one until one returns true).
function chainCommands() {
  var commands = [], len = arguments.length;
  while ( len-- ) commands[ len ] = arguments[ len ];

  return function(state, dispatch, view) {
    for (var i = 0; i < commands.length; i++)
      { if (commands[i](state, dispatch, view)) { return true } }
    return false
  }
}

var backspace = chainCommands(deleteSelection, joinBackward, selectNodeBackward);
var del = chainCommands(deleteSelection, joinForward, selectNodeForward);

// :: Object
// A basic keymap containing bindings not specific to any schema.
// Binds the following keys (when multiple commands are listed, they
// are chained with [`chainCommands`](#commands.chainCommands)):
//
// * **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
// * **Mod-Enter** to `exitCode`
// * **Backspace** and **Mod-Backspace** to `deleteSelection`, `joinBackward`, `selectNodeBackward`
// * **Delete** and **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
// * **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
// * **Mod-a** to `selectAll`
var pcBaseKeymap = {
  "Enter": chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
  "Mod-Enter": exitCode,
  "Backspace": backspace,
  "Mod-Backspace": backspace,
  "Delete": del,
  "Mod-Delete": del,
  "Mod-a": selectAll
};

// :: Object
// A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
// **Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
// **Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
// Ctrl-Delete.
var macBaseKeymap = {
  "Ctrl-h": pcBaseKeymap["Backspace"],
  "Alt-Backspace": pcBaseKeymap["Mod-Backspace"],
  "Ctrl-d": pcBaseKeymap["Delete"],
  "Ctrl-Alt-Backspace": pcBaseKeymap["Mod-Delete"],
  "Alt-Delete": pcBaseKeymap["Mod-Delete"],
  "Alt-d": pcBaseKeymap["Mod-Delete"]
};
for (var key in pcBaseKeymap) { macBaseKeymap[key] = pcBaseKeymap[key]; }

// declare global: os, navigator
var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform)
          : typeof os != "undefined" ? os.platform() == "darwin" : false;

// :: Object
// Depending on the detected platform, this will hold
// [`pcBasekeymap`](#commands.pcBaseKeymap) or
// [`macBaseKeymap`](#commands.macBaseKeymap).
var baseKeymap = mac ? macBaseKeymap : pcBaseKeymap;

exports.deleteSelection = deleteSelection;
exports.joinBackward = joinBackward;
exports.selectNodeBackward = selectNodeBackward;
exports.joinForward = joinForward;
exports.selectNodeForward = selectNodeForward;
exports.joinUp = joinUp;
exports.joinDown = joinDown;
exports.lift = lift;
exports.newlineInCode = newlineInCode;
exports.exitCode = exitCode;
exports.createParagraphNear = createParagraphNear;
exports.liftEmptyBlock = liftEmptyBlock;
exports.splitBlock = splitBlock;
exports.splitBlockKeepMarks = splitBlockKeepMarks;
exports.selectParentNode = selectParentNode;
exports.selectAll = selectAll;
exports.wrapIn = wrapIn;
exports.setBlockType = setBlockType;
exports.toggleMark = toggleMark;
exports.autoJoin = autoJoin;
exports.chainCommands = chainCommands;
exports.pcBaseKeymap = pcBaseKeymap;
exports.macBaseKeymap = macBaseKeymap;
exports.baseKeymap = baseKeymap;
//# sourceMappingURL=commands.js.map

},{"prosemirror-transform":"../node_modules/prosemirror-transform/dist/index.js","prosemirror-model":"../node_modules/prosemirror-model/dist/index.js","prosemirror-state":"../node_modules/prosemirror-state/dist/index.js"}],"components/ProseMirror/Utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.marker = marker;
exports.getActiveMarks = getActiveMarks;
exports.markIsActive = markIsActive;
exports.getHTML = getHTML;
exports.getMarkAttrs = getMarkAttrs;

var _prosemirrorState = require("prosemirror-state");

var _prosemirrorModel = require("prosemirror-model");

var _prosemirrorCommands = require("prosemirror-commands");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function marker(schema, view, mark, attrs) {
  if (schema.marks[mark]) {
    (0, _prosemirrorCommands.toggleMark)(schema.marks[mark], attrs)(view.state, view.dispatch);
  }

  view.focus();
}

;

function getActiveMarks(schema, state, markTypes) {
  var marks = [];
  markTypes.forEach(function (markType) {
    var mark = schema.marks[markType];

    if (mark && markIsActive(state, mark)) {
      marks.push(mark.name);
    }
  });
  return marks;
}

;

function markIsActive(state, type) {
  var _state$selection = state.selection,
      from = _state$selection.from,
      $from = _state$selection.$from,
      to = _state$selection.to,
      empty = _state$selection.empty;

  if (empty) {
    return !!type.isInSet(state.storedMarks || $from.marks());
  }

  return !!state.doc.rangeHasMark(from, to, type);
}

;

function getHTML(state, code) {
  var div = document.createElement('div');

  var fragment = _prosemirrorModel.DOMSerializer.fromSchema(state.schema).serializeFragment(state.doc.content);

  div.appendChild(fragment);
  return code ? div.innerText : div.innerHTML;
}

;

function getMarkAttrs(state, type) {
  var _state$selection2 = state.selection,
      from = _state$selection2.from,
      to = _state$selection2.to;
  var marks = [];
  state.doc.nodesBetween(from, to, function (node) {
    marks = [].concat(_toConsumableArray(marks), _toConsumableArray(node.marks));
  });
  var mark = marks.find(function (markItem) {
    return markItem.type.name === type;
  });

  if (mark) {
    return mark.attrs;
  }

  return {};
}

;
},{"prosemirror-state":"../node_modules/prosemirror-state/dist/index.js","prosemirror-model":"../node_modules/prosemirror-model/dist/index.js","prosemirror-commands":"../node_modules/prosemirror-commands/dist/commands.js"}],"../node_modules/vue-hot-reload-api/dist/index.js":[function(require,module,exports) {
var Vue // late bind
var version
var map = Object.create(null)
if (typeof window !== 'undefined') {
  window.__VUE_HOT_MAP__ = map
}
var installed = false
var isBrowserify = false
var initHookName = 'beforeCreate'

exports.install = function (vue, browserify) {
  if (installed) { return }
  installed = true

  Vue = vue.__esModule ? vue.default : vue
  version = Vue.version.split('.').map(Number)
  isBrowserify = browserify

  // compat with < 2.0.0-alpha.7
  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init'
  }

  exports.compatible = version[0] >= 2
  if (!exports.compatible) {
    console.warn(
      '[HMR] You are using a version of vue-hot-reload-api that is ' +
        'only compatible with Vue.js core ^2.0.0.'
    )
    return
  }
}

/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if(map[id]) { return }

  var Ctor = null
  if (typeof options === 'function') {
    Ctor = options
    options = Ctor.options
  }
  makeOptionsHot(id, options)
  map[id] = {
    Ctor: Ctor,
    options: options,
    instances: []
  }
}

/**
 * Check if module is recorded
 *
 * @param {String} id
 */

exports.isRecorded = function (id) {
  return typeof map[id] !== 'undefined'
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot(id, options) {
  if (options.functional) {
    var render = options.render
    options.render = function (h, ctx) {
      var instances = map[id].instances
      if (ctx && instances.indexOf(ctx.parent) < 0) {
        instances.push(ctx.parent)
      }
      return render(h, ctx)
    }
  } else {
    injectHook(options, initHookName, function() {
      var record = map[id]
      if (!record.Ctor) {
        record.Ctor = this.constructor
      }
      record.instances.push(this)
    })
    injectHook(options, 'beforeDestroy', function() {
      var instances = map[id].instances
      instances.splice(instances.indexOf(this), 1)
    })
  }
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook(options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing) ? existing.concat(hook) : [existing, hook]
    : [hook]
}

function tryWrap(fn) {
  return function (id, arg) {
    try {
      fn(id, arg)
    } catch (e) {
      console.error(e)
      console.warn(
        'Something went wrong during Vue component hot-reload. Full reload required.'
      )
    }
  }
}

function updateOptions (oldOptions, newOptions) {
  for (var key in oldOptions) {
    if (!(key in newOptions)) {
      delete oldOptions[key]
    }
  }
  for (var key$1 in newOptions) {
    oldOptions[key$1] = newOptions[key$1]
  }
}

exports.rerender = tryWrap(function (id, options) {
  var record = map[id]
  if (!options) {
    record.instances.slice().forEach(function (instance) {
      instance.$forceUpdate()
    })
    return
  }
  if (typeof options === 'function') {
    options = options.options
  }
  if (record.Ctor) {
    record.Ctor.options.render = options.render
    record.Ctor.options.staticRenderFns = options.staticRenderFns
    record.instances.slice().forEach(function (instance) {
      instance.$options.render = options.render
      instance.$options.staticRenderFns = options.staticRenderFns
      // reset static trees
      // pre 2.5, all static trees are cached together on the instance
      if (instance._staticTrees) {
        instance._staticTrees = []
      }
      // 2.5.0
      if (Array.isArray(record.Ctor.options.cached)) {
        record.Ctor.options.cached = []
      }
      // 2.5.3
      if (Array.isArray(instance.$options.cached)) {
        instance.$options.cached = []
      }

      // post 2.5.4: v-once trees are cached on instance._staticTrees.
      // Pure static trees are cached on the staticRenderFns array
      // (both already reset above)

      // 2.6: temporarily mark rendered scoped slots as unstable so that
      // child components can be forced to update
      var restore = patchScopedSlots(instance)
      instance.$forceUpdate()
      instance.$nextTick(restore)
    })
  } else {
    // functional or no instance created yet
    record.options.render = options.render
    record.options.staticRenderFns = options.staticRenderFns

    // handle functional component re-render
    if (record.options.functional) {
      // rerender with full options
      if (Object.keys(options).length > 2) {
        updateOptions(record.options, options)
      } else {
        // template-only rerender.
        // need to inject the style injection code for CSS modules
        // to work properly.
        var injectStyles = record.options._injectStyles
        if (injectStyles) {
          var render = options.render
          record.options.render = function (h, ctx) {
            injectStyles.call(ctx)
            return render(h, ctx)
          }
        }
      }
      record.options._Ctor = null
      // 2.5.3
      if (Array.isArray(record.options.cached)) {
        record.options.cached = []
      }
      record.instances.slice().forEach(function (instance) {
        instance.$forceUpdate()
      })
    }
  }
})

exports.reload = tryWrap(function (id, options) {
  var record = map[id]
  if (options) {
    if (typeof options === 'function') {
      options = options.options
    }
    makeOptionsHot(id, options)
    if (record.Ctor) {
      if (version[1] < 2) {
        // preserve pre 2.2 behavior for global mixin handling
        record.Ctor.extendOptions = options
      }
      var newCtor = record.Ctor.super.extend(options)
      record.Ctor.options = newCtor.options
      record.Ctor.cid = newCtor.cid
      record.Ctor.prototype = newCtor.prototype
      if (newCtor.release) {
        // temporary global mixin strategy used in < 2.0.0-alpha.6
        newCtor.release()
      }
    } else {
      updateOptions(record.options, options)
    }
  }
  record.instances.slice().forEach(function (instance) {
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate()
    } else {
      console.warn(
        'Root or manually mounted instance modified. Full reload required.'
      )
    }
  })
})

// 2.6 optimizes template-compiled scoped slots and skips updates if child
// only uses scoped slots. We need to patch the scoped slots resolving helper
// to temporarily mark all scoped slots as unstable in order to force child
// updates.
function patchScopedSlots (instance) {
  if (!instance._u) { return }
  // https://github.com/vuejs/vue/blob/dev/src/core/instance/render-helpers/resolve-scoped-slots.js
  var original = instance._u
  instance._u = function (slots) {
    try {
      // 2.6.4 ~ 2.6.6
      return original(slots, true)
    } catch (e) {
      // 2.5 / >= 2.6.7
      return original(slots, null, true)
    }
  }
  return function () {
    instance._u = original
  }
}

},{}],"../node_modules/vue/dist/vue.runtime.esm.js":[function(require,module,exports) {
var global = arguments[3];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*!
 * Vue.js v2.6.10
 * (c) 2014-2019 Evan You
 * Released under the MIT License.
 */

/*  */
var emptyObject = Object.freeze({}); // These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.

function isUndef(v) {
  return v === undefined || v === null;
}

function isDef(v) {
  return v !== undefined && v !== null;
}

function isTrue(v) {
  return v === true;
}

function isFalse(v) {
  return v === false;
}
/**
 * Check if value is primitive.
 */


function isPrimitive(value) {
  return typeof value === 'string' || typeof value === 'number' || // $flow-disable-line
  typeof value === 'symbol' || typeof value === 'boolean';
}
/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */


function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}
/**
 * Get the raw type string of a value, e.g., [object Object].
 */


var _toString = Object.prototype.toString;

function toRawType(value) {
  return _toString.call(value).slice(8, -1);
}
/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */


function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]';
}
/**
 * Check if val is a valid array index.
 */


function isValidArrayIndex(val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}

function isPromise(val) {
  return isDef(val) && typeof val.then === 'function' && typeof val.catch === 'function';
}
/**
 * Convert a value to a string that is actually rendered.
 */


function toString(val) {
  return val == null ? '' : Array.isArray(val) || isPlainObject(val) && val.toString === _toString ? JSON.stringify(val, null, 2) : String(val);
}
/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */


function toNumber(val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n;
}
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */


function makeMap(str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');

  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return expectsLowerCase ? function (val) {
    return map[val.toLowerCase()];
  } : function (val) {
    return map[val];
  };
}
/**
 * Check if a tag is a built-in tag.
 */


var isBuiltInTag = makeMap('slot,component', true);
/**
 * Check if an attribute is a reserved attribute.
 */

var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');
/**
 * Remove an item from an array.
 */

function remove(arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);

    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
/**
 * Check whether an object has the property.
 */


var hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
/**
 * Create a cached version of a pure function.
 */


function cached(fn) {
  var cache = Object.create(null);
  return function cachedFn(str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}
/**
 * Camelize a hyphen-delimited string.
 */


var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
});
/**
 * Capitalize a string.
 */

var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
/**
 * Hyphenate a camelCase string.
 */

var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase();
});
/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */

function polyfillBind(fn, ctx) {
  function boundFn(a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  }

  boundFn._length = fn.length;
  return boundFn;
}

function nativeBind(fn, ctx) {
  return fn.bind(ctx);
}

var bind = Function.prototype.bind ? nativeBind : polyfillBind;
/**
 * Convert an Array-like object to a real Array.
 */

function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);

  while (i--) {
    ret[i] = list[i + start];
  }

  return ret;
}
/**
 * Mix properties into target object.
 */


function extend(to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }

  return to;
}
/**
 * Merge an Array of Objects into a single Object.
 */


function toObject(arr) {
  var res = {};

  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }

  return res;
}
/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */


function noop(a, b, c) {}
/**
 * Always return false.
 */


var no = function (a, b, c) {
  return false;
};
/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */


var identity = function (_) {
  return _;
};
/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */


function looseEqual(a, b) {
  if (a === b) {
    return true;
  }

  var isObjectA = isObject(a);
  var isObjectB = isObject(b);

  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);

      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i]);
        });
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key]);
        });
      } else {
        /* istanbul ignore next */
        return false;
      }
    } catch (e) {
      /* istanbul ignore next */
      return false;
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
}
/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */


function looseIndexOf(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }

  return -1;
}
/**
 * Ensure a function is called only once.
 */


function once(fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  };
}

var SSR_ATTR = 'data-server-rendered';
var ASSET_TYPES = ['component', 'directive', 'filter'];
var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'activated', 'deactivated', 'errorCaptured', 'serverPrefetch'];
/*  */

var config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
};
/*  */

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */

var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
/**
 * Check if a string starts with $ or _
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}
/**
 * Define a property.
 */


function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}
/**
 * Parse simple path.
 */


var bailRE = new RegExp("[^" + unicodeRegExp.source + ".$_\\d]");

function parsePath(path) {
  if (bailRE.test(path)) {
    return;
  }

  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) {
        return;
      }

      obj = obj[segments[i]];
    }

    return obj;
  };
}
/*  */
// can we use __proto__?


var hasProto = '__proto__' in {}; // Browser environment sniffing

var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = UA && UA.indexOf('android') > 0 || weexPlatform === 'android';
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA) || weexPlatform === 'ios';
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
var isPhantomJS = UA && /phantomjs/.test(UA);
var isFF = UA && UA.match(/firefox\/(\d+)/); // Firefox has a "watch" function on Object.prototype...

var nativeWatch = {}.watch;
var supportsPassive = false;

if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', {
      get: function get() {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    }); // https://github.com/facebook/flow/issues/285

    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
} // this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV


var _isServer;

var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }

  return _isServer;
}; // detect devtools


var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
/* istanbul ignore next */

function isNative(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}

var hasSymbol = typeof Symbol !== 'undefined' && isNative(Symbol) && typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

var _Set;
/* istanbul ignore if */
// $flow-disable-line


if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set =
  /*@__PURE__*/
  function () {
    function Set() {
      this.set = Object.create(null);
    }

    Set.prototype.has = function has(key) {
      return this.set[key] === true;
    };

    Set.prototype.add = function add(key) {
      this.set[key] = true;
    };

    Set.prototype.clear = function clear() {
      this.set = Object.create(null);
    };

    return Set;
  }();
}
/*  */


var warn = noop;
var tip = noop;
var generateComponentTrace = noop; // work around flow check

var formatComponentName = noop;

if ("development" !== 'production') {
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;

  var classify = function (str) {
    return str.replace(classifyRE, function (c) {
      return c.toUpperCase();
    }).replace(/[-_]/g, '');
  };

  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && !config.silent) {
      console.error("[Vue warn]: " + msg + trace);
    }
  };

  tip = function (msg, vm) {
    if (hasConsole && !config.silent) {
      console.warn("[Vue tip]: " + msg + (vm ? generateComponentTrace(vm) : ''));
    }
  };

  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>';
    }

    var options = typeof vm === 'function' && vm.cid != null ? vm.options : vm._isVue ? vm.$options || vm.constructor.options : vm;
    var name = options.name || options._componentTag;
    var file = options.__file;

    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (name ? "<" + classify(name) + ">" : "<Anonymous>") + (file && includeFile !== false ? " at " + file : '');
  };

  var repeat = function (str, n) {
    var res = '';

    while (n) {
      if (n % 2 === 1) {
        res += str;
      }

      if (n > 1) {
        str += str;
      }

      n >>= 1;
    }

    return res;
  };

  generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;

      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];

          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue;
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }

        tree.push(vm);
        vm = vm.$parent;
      }

      return '\n\nfound in\n\n' + tree.map(function (vm, i) {
        return "" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm) ? formatComponentName(vm[0]) + "... (" + vm[1] + " recursive calls)" : formatComponentName(vm));
      }).join('\n');
    } else {
      return "\n\n(found in " + formatComponentName(vm) + ")";
    }
  };
}
/*  */


var uid = 0;
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */

var Dep = function Dep() {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub(sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub(sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend() {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify() {
  // stabilize the subscriber list first
  var subs = this.subs.slice();

  if ("development" !== 'production' && !config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort(function (a, b) {
      return a.id - b.id;
    });
  }

  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
}; // The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.


Dep.target = null;
var targetStack = [];

function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
/*  */


var VNode = function VNode(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.fnContext = undefined;
  this.fnOptions = undefined;
  this.fnScopeId = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = {
  child: {
    configurable: true
  }
}; // DEPRECATED: alias for componentInstance for backwards compat.

/* istanbul ignore next */

prototypeAccessors.child.get = function () {
  return this.componentInstance;
};

Object.defineProperties(VNode.prototype, prototypeAccessors);

var createEmptyVNode = function (text) {
  if (text === void 0) text = '';
  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node;
};

function createTextVNode(val) {
  return new VNode(undefined, undefined, undefined, String(val));
} // optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.


function cloneVNode(vnode) {
  var cloned = new VNode(vnode.tag, vnode.data, // #7975
  // clone children array to avoid mutating original in case of cloning
  // a child.
  vnode.children && vnode.children.slice(), vnode.text, vnode.elm, vnode.context, vnode.componentOptions, vnode.asyncFactory);
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned;
}
/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */


var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);
var methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
/**
 * Intercept mutating methods and emit events
 */

methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    var args = [],
        len = arguments.length;

    while (len--) args[len] = arguments[len];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;

    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;

      case 'splice':
        inserted = args.slice(2);
        break;
    }

    if (inserted) {
      ob.observeArray(inserted);
    } // notify change


    ob.dep.notify();
    return result;
  });
});
/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */

var shouldObserve = true;

function toggleObserving(value) {
  shouldObserve = value;
}
/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */


var Observer = function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);

  if (Array.isArray(value)) {
    if (hasProto) {
      protoAugment(value, arrayMethods);
    } else {
      copyAugment(value, arrayMethods, arrayKeys);
    }

    this.observeArray(value);
  } else {
    this.walk(value);
  }
};
/**
 * Walk through all properties and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */


Observer.prototype.walk = function walk(obj) {
  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i]);
  }
};
/**
 * Observe a list of Array items.
 */


Observer.prototype.observeArray = function observeArray(items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
}; // helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */


function protoAugment(target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}
/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */

/* istanbul ignore next */


function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */


function observe(value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }

  var ob;

  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldObserve && !isServerRendering() && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }

  if (asRootData && ob) {
    ob.vmCount++;
  }

  return ob;
}
/**
 * Define a reactive property on an Object.
 */


function defineReactive$$1(obj, key, val, customSetter, shallow) {
  var dep = new Dep();
  var property = Object.getOwnPropertyDescriptor(obj, key);

  if (property && property.configurable === false) {
    return;
  } // cater for pre-defined getter/setters


  var getter = property && property.get;
  var setter = property && property.set;

  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;

      if (Dep.target) {
        dep.depend();

        if (childOb) {
          childOb.dep.depend();

          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }

      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */

      if (newVal === value || newVal !== newVal && value !== value) {
        return;
      }
      /* eslint-enable no-self-compare */


      if ("development" !== 'production' && customSetter) {
        customSetter();
      } // #7981: for accessor properties without setter


      if (getter && !setter) {
        return;
      }

      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }

      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */


function set(target, key, val) {
  if ("development" !== 'production' && (isUndef(target) || isPrimitive(target))) {
    warn("Cannot set reactive property on undefined, null, or primitive value: " + target);
  }

  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }

  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val;
  }

  var ob = target.__ob__;

  if (target._isVue || ob && ob.vmCount) {
    "development" !== 'production' && warn('Avoid adding reactive properties to a Vue instance or its root $data ' + 'at runtime - declare it upfront in the data option.');
    return val;
  }

  if (!ob) {
    target[key] = val;
    return val;
  }

  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val;
}
/**
 * Delete a property and trigger change if necessary.
 */


function del(target, key) {
  if ("development" !== 'production' && (isUndef(target) || isPrimitive(target))) {
    warn("Cannot delete reactive property on undefined, null, or primitive value: " + target);
  }

  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }

  var ob = target.__ob__;

  if (target._isVue || ob && ob.vmCount) {
    "development" !== 'production' && warn('Avoid deleting properties on a Vue instance or its root $data ' + '- just set it to null.');
    return;
  }

  if (!hasOwn(target, key)) {
    return;
  }

  delete target[key];

  if (!ob) {
    return;
  }

  ob.dep.notify();
}
/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */


function dependArray(value) {
  for (var e = void 0, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();

    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}
/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */


var strats = config.optionMergeStrategies;
/**
 * Options with restrictions
 */

if ("development" !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn("option \"" + key + "\" can only be used during instance " + 'creation with the `new` keyword.');
    }

    return defaultStrat(parent, child);
  };
}
/**
 * Helper that recursively merges two data objects together.
 */


function mergeData(to, from) {
  if (!from) {
    return to;
  }

  var key, toVal, fromVal;
  var keys = hasSymbol ? Reflect.ownKeys(from) : Object.keys(from);

  for (var i = 0; i < keys.length; i++) {
    key = keys[i]; // in case the object is already observed...

    if (key === '__ob__') {
      continue;
    }

    toVal = to[key];
    fromVal = from[key];

    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (toVal !== fromVal && isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }

  return to;
}
/**
 * Data
 */


function mergeDataOrFn(parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }

    if (!parentVal) {
      return childVal;
    } // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.


    return function mergedDataFn() {
      return mergeData(typeof childVal === 'function' ? childVal.call(this, this) : childVal, typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal);
    };
  } else {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm, vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal;

      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
}

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      "development" !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
      return parentVal;
    }

    return mergeDataOrFn(parentVal, childVal);
  }

  return mergeDataOrFn(parentVal, childVal, vm);
};
/**
 * Hooks and props are merged as arrays.
 */


function mergeHook(parentVal, childVal) {
  var res = childVal ? parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal] : parentVal;
  return res ? dedupeHooks(res) : res;
}

function dedupeHooks(hooks) {
  var res = [];

  for (var i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }

  return res;
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});
/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets(parentVal, childVal, vm, key) {
  var res = Object.create(parentVal || null);

  if (childVal) {
    "development" !== 'production' && assertObjectType(key, childVal, vm);
    return extend(res, childVal);
  } else {
    return res;
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});
/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = function (parentVal, childVal, vm, key) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) {
    parentVal = undefined;
  }

  if (childVal === nativeWatch) {
    childVal = undefined;
  }
  /* istanbul ignore if */


  if (!childVal) {
    return Object.create(parentVal || null);
  }

  if ("development" !== 'production') {
    assertObjectType(key, childVal, vm);
  }

  if (!parentVal) {
    return childVal;
  }

  var ret = {};
  extend(ret, parentVal);

  for (var key$1 in childVal) {
    var parent = ret[key$1];
    var child = childVal[key$1];

    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }

    ret[key$1] = parent ? parent.concat(child) : Array.isArray(child) ? child : [child];
  }

  return ret;
};
/**
 * Other object hashes.
 */


strats.props = strats.methods = strats.inject = strats.computed = function (parentVal, childVal, vm, key) {
  if (childVal && "development" !== 'production') {
    assertObjectType(key, childVal, vm);
  }

  if (!parentVal) {
    return childVal;
  }

  var ret = Object.create(null);
  extend(ret, parentVal);

  if (childVal) {
    extend(ret, childVal);
  }

  return ret;
};

strats.provide = mergeDataOrFn;
/**
 * Default strategy.
 */

var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};
/**
 * Validate component names
 */


function checkComponents(options) {
  for (var key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName(name) {
  if (!new RegExp("^[a-zA-Z][\\-\\.0-9_" + unicodeRegExp.source + "]*$").test(name)) {
    warn('Invalid component name: "' + name + '". Component names ' + 'should conform to valid custom element name in html5 specification.');
  }

  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + name);
  }
}
/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */


function normalizeProps(options, vm) {
  var props = options.props;

  if (!props) {
    return;
  }

  var res = {};
  var i, val, name;

  if (Array.isArray(props)) {
    i = props.length;

    while (i--) {
      val = props[i];

      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = {
          type: null
        };
      } else if ("development" !== 'production') {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val) ? val : {
        type: val
      };
    }
  } else if ("development" !== 'production') {
    warn("Invalid value for option \"props\": expected an Array or an Object, " + "but got " + toRawType(props) + ".", vm);
  }

  options.props = res;
}
/**
 * Normalize all injections into Object-based format
 */


function normalizeInject(options, vm) {
  var inject = options.inject;

  if (!inject) {
    return;
  }

  var normalized = options.inject = {};

  if (Array.isArray(inject)) {
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = {
        from: inject[i]
      };
    }
  } else if (isPlainObject(inject)) {
    for (var key in inject) {
      var val = inject[key];
      normalized[key] = isPlainObject(val) ? extend({
        from: key
      }, val) : {
        from: val
      };
    }
  } else if ("development" !== 'production') {
    warn("Invalid value for option \"inject\": expected an Array or an Object, " + "but got " + toRawType(inject) + ".", vm);
  }
}
/**
 * Normalize raw function directives into object format.
 */


function normalizeDirectives(options) {
  var dirs = options.directives;

  if (dirs) {
    for (var key in dirs) {
      var def$$1 = dirs[key];

      if (typeof def$$1 === 'function') {
        dirs[key] = {
          bind: def$$1,
          update: def$$1
        };
      }
    }
  }
}

function assertObjectType(name, value, vm) {
  if (!isPlainObject(value)) {
    warn("Invalid value for option \"" + name + "\": expected an Object, " + "but got " + toRawType(value) + ".", vm);
  }
}
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */


function mergeOptions(parent, child, vm) {
  if ("development" !== 'production') {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child); // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.

  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm);
    }

    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
  }

  var options = {};
  var key;

  for (key in parent) {
    mergeField(key);
  }

  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }

  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }

  return options;
}
/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */


function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }

  var assets = options[type]; // check local registration variations first

  if (hasOwn(assets, id)) {
    return assets[id];
  }

  var camelizedId = camelize(id);

  if (hasOwn(assets, camelizedId)) {
    return assets[camelizedId];
  }

  var PascalCaseId = capitalize(camelizedId);

  if (hasOwn(assets, PascalCaseId)) {
    return assets[PascalCaseId];
  } // fallback to prototype chain


  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];

  if ("development" !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }

  return res;
}
/*  */


function validateProp(key, propOptions, propsData, vm) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key]; // boolean casting

  var booleanIndex = getTypeIndex(Boolean, prop.type);

  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      var stringIndex = getTypeIndex(String, prop.type);

      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  } // check default value


  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key); // since the default value is a fresh copy,
    // make sure to observe it.

    var prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }

  if ("development" !== 'production' && // skip validation for weex recycle-list child component props
  !false) {
    assertProp(prop, key, value, vm, absent);
  }

  return value;
}
/**
 * Get the default value of a prop.
 */


function getPropDefaultValue(vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined;
  }

  var def = prop.default; // warn against non-factory defaults for Object & Array

  if ("development" !== 'production' && isObject(def)) {
    warn('Invalid default value for prop "' + key + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  } // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger


  if (vm && vm.$options.propsData && vm.$options.propsData[key] === undefined && vm._props[key] !== undefined) {
    return vm._props[key];
  } // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context


  return typeof def === 'function' && getType(prop.type) !== 'Function' ? def.call(vm) : def;
}
/**
 * Assert whether a prop is valid.
 */


function assertProp(prop, name, value, vm, absent) {
  if (prop.required && absent) {
    warn('Missing required prop: "' + name + '"', vm);
    return;
  }

  if (value == null && !prop.required) {
    return;
  }

  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];

  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }

    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }

  if (!valid) {
    warn(getInvalidTypeMessage(name, value, expectedTypes), vm);
    return;
  }

  var validator = prop.validator;

  if (validator) {
    if (!validator(value)) {
      warn('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType(value, type) {
  var valid;
  var expectedType = getType(type);

  if (simpleCheckRE.test(expectedType)) {
    var t = typeof value;
    valid = t === expectedType.toLowerCase(); // for primitive wrapper objects

    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }

  return {
    valid: valid,
    expectedType: expectedType
  };
}
/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */


function getType(fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : '';
}

function isSameType(a, b) {
  return getType(a) === getType(b);
}

function getTypeIndex(type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }

  for (var i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i;
    }
  }

  return -1;
}

function getInvalidTypeMessage(name, value, expectedTypes) {
  var message = "Invalid prop: type check failed for prop \"" + name + "\"." + " Expected " + expectedTypes.map(capitalize).join(', ');
  var expectedType = expectedTypes[0];
  var receivedType = toRawType(value);
  var expectedValue = styleValue(value, expectedType);
  var receivedValue = styleValue(value, receivedType); // check if we need to specify expected value

  if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) {
    message += " with value " + expectedValue;
  }

  message += ", got " + receivedType + " "; // check if we need to specify received value

  if (isExplicable(receivedType)) {
    message += "with value " + receivedValue + ".";
  }

  return message;
}

function styleValue(value, type) {
  if (type === 'String') {
    return "\"" + value + "\"";
  } else if (type === 'Number') {
    return "" + Number(value);
  } else {
    return "" + value;
  }
}

function isExplicable(value) {
  var explicitTypes = ['string', 'number', 'boolean'];
  return explicitTypes.some(function (elem) {
    return value.toLowerCase() === elem;
  });
}

function isBoolean() {
  var args = [],
      len = arguments.length;

  while (len--) args[len] = arguments[len];

  return args.some(function (elem) {
    return elem.toLowerCase() === 'boolean';
  });
}
/*  */


function handleError(err, vm, info) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget();

  try {
    if (vm) {
      var cur = vm;

      while (cur = cur.$parent) {
        var hooks = cur.$options.errorCaptured;

        if (hooks) {
          for (var i = 0; i < hooks.length; i++) {
            try {
              var capture = hooks[i].call(cur, err, vm, info) === false;

              if (capture) {
                return;
              }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }

    globalHandleError(err, vm, info);
  } finally {
    popTarget();
  }
}

function invokeWithErrorHandling(handler, context, args, vm, info) {
  var res;

  try {
    res = args ? handler.apply(context, args) : handler.call(context);

    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(function (e) {
        return handleError(e, vm, info + " (Promise/async)");
      }); // issue #9511
      // avoid catch triggering multiple times when nested calls

      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }

  return res;
}

function globalHandleError(err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info);
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler');
      }
    }
  }

  logError(err, vm, info);
}

function logError(err, vm, info) {
  if ("development" !== 'production') {
    warn("Error in " + info + ": \"" + err.toString() + "\"", vm);
  }
  /* istanbul ignore else */


  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err;
  }
}
/*  */


var isUsingMicroTask = false;
var callbacks = [];
var pending = false;

function flushCallbacks() {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;

  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
} // Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).


var timerFunc; // The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:

/* istanbul ignore next, $flow-disable-line */

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();

  timerFunc = function () {
    p.then(flushCallbacks); // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.

    if (isIOS) {
      setTimeout(noop);
    }
  };

  isUsingMicroTask = true;
} else if (!isIE && typeof MutationObserver !== 'undefined' && (isNative(MutationObserver) || // PhantomJS and iOS 7.x
MutationObserver.toString() === '[object MutationObserverConstructor]')) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  var counter = 1;
  var observer = new MutationObserver(flushCallbacks);
  var textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });

  timerFunc = function () {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };

  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Techinically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  timerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}

function nextTick(cb, ctx) {
  var _resolve;

  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });

  if (!pending) {
    pending = true;
    timerFunc();
  } // $flow-disable-line


  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    });
  }
}
/*  */

/* not type checking this file because flow doesn't play well with Proxy */


var initProxy;

if ("development" !== 'production') {
  var allowedGlobals = makeMap('Infinity,undefined,NaN,isFinite,isNaN,' + 'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' + 'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' + 'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn("Property or method \"" + key + "\" is not defined on the instance but " + 'referenced during render. Make sure that this property is reactive, ' + 'either in the data option, or for class-based components, by ' + 'initializing the property. ' + 'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.', target);
  };

  var warnReservedPrefix = function (target, key) {
    warn("Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " + 'properties starting with "$" or "_" are not proxied in the Vue instance to ' + 'prevent conflicts with Vue internals' + 'See: https://vuejs.org/v2/api/#data', target);
  };

  var hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set(target, key, value) {
        if (isBuiltInModifier(key)) {
          warn("Avoid overwriting built-in modifier in config.keyCodes: ." + key);
          return false;
        } else {
          target[key] = value;
          return true;
        }
      }
    });
  }

  var hasHandler = {
    has: function has(target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) || typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data);

      if (!has && !isAllowed) {
        if (key in target.$data) {
          warnReservedPrefix(target, key);
        } else {
          warnNonPresent(target, key);
        }
      }

      return has || !isAllowed;
    }
  };
  var getHandler = {
    get: function get(target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) {
          warnReservedPrefix(target, key);
        } else {
          warnNonPresent(target, key);
        }
      }

      return target[key];
    }
  };

  initProxy = function initProxy(vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped ? getHandler : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}
/*  */


var seenObjects = new _Set();
/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */

function traverse(val) {
  _traverse(val, seenObjects);

  seenObjects.clear();
}

function _traverse(val, seen) {
  var i, keys;
  var isA = Array.isArray(val);

  if (!isA && !isObject(val) || Object.isFrozen(val) || val instanceof VNode) {
    return;
  }

  if (val.__ob__) {
    var depId = val.__ob__.dep.id;

    if (seen.has(depId)) {
      return;
    }

    seen.add(depId);
  }

  if (isA) {
    i = val.length;

    while (i--) {
      _traverse(val[i], seen);
    }
  } else {
    keys = Object.keys(val);
    i = keys.length;

    while (i--) {
      _traverse(val[keys[i]], seen);
    }
  }
}

var mark;
var measure;

if ("development" !== 'production') {
  var perf = inBrowser && window.performance;
  /* istanbul ignore if */

  if (perf && perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures) {
    mark = function (tag) {
      return perf.mark(tag);
    };

    measure = function (name, startTag, endTag) {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag); // perf.clearMeasures(name)
    };
  }
}
/*  */


var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first

  name = once$$1 ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once$$1,
    capture: capture,
    passive: passive
  };
});

function createFnInvoker(fns, vm) {
  function invoker() {
    var arguments$1 = arguments;
    var fns = invoker.fns;

    if (Array.isArray(fns)) {
      var cloned = fns.slice();

      for (var i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler");
    }
  }

  invoker.fns = fns;
  return invoker;
}

function updateListeners(on, oldOn, add, remove$$1, createOnceHandler, vm) {
  var name, def$$1, cur, old, event;

  for (name in on) {
    def$$1 = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);

    if (isUndef(cur)) {
      "development" !== 'production' && warn("Invalid handler for event \"" + event.name + "\": got " + String(cur), vm);
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm);
      }

      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture);
      }

      add(event.name, cur, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }

  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name], event.capture);
    }
  }
}
/*  */


function mergeVNodeHook(def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }

  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook() {
    hook.apply(this, arguments); // important: remove merged hook to ensure it's called only once
    // and prevent memory leak

    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}
/*  */


function extractPropsFromVNodeData(data, Ctor, tag) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;

  if (isUndef(propOptions)) {
    return;
  }

  var res = {};
  var attrs = data.attrs;
  var props = data.props;

  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);

      if ("development" !== 'production') {
        var keyInLowerCase = key.toLowerCase();

        if (key !== keyInLowerCase && attrs && hasOwn(attrs, keyInLowerCase)) {
          tip("Prop \"" + keyInLowerCase + "\" is passed to component " + formatComponentName(tag || Ctor) + ", but the declared prop name is" + " \"" + key + "\". " + "Note that HTML attributes are case-insensitive and camelCased " + "props need to use their kebab-case equivalents when using in-DOM " + "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\".");
        }
      }

      checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey, false);
    }
  }

  return res;
}

function checkProp(res, hash, key, altKey, preserve) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];

      if (!preserve) {
        delete hash[key];
      }

      return true;
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];

      if (!preserve) {
        delete hash[altKey];
      }

      return true;
    }
  }

  return false;
}
/*  */
// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:
// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.


function simpleNormalizeChildren(children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children);
    }
  }

  return children;
} // 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.


function normalizeChildren(children) {
  return isPrimitive(children) ? [createTextVNode(children)] : Array.isArray(children) ? normalizeArrayChildren(children) : undefined;
}

function isTextNode(node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment);
}

function normalizeArrayChildren(children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;

  for (i = 0; i < children.length; i++) {
    c = children[i];

    if (isUndef(c) || typeof c === 'boolean') {
      continue;
    }

    lastIndex = res.length - 1;
    last = res[lastIndex]; //  nested

    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, (nestedIndex || '') + "_" + i); // merge adjacent text nodes

        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c[0].text);
          c.shift();
        }

        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) && isDef(c.tag) && isUndef(c.key) && isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }

        res.push(c);
      }
    }
  }

  return res;
}
/*  */


function initProvide(vm) {
  var provide = vm.$options.provide;

  if (provide) {
    vm._provided = typeof provide === 'function' ? provide.call(vm) : provide;
  }
}

function initInjections(vm) {
  var result = resolveInject(vm.$options.inject, vm);

  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      if ("development" !== 'production') {
        defineReactive$$1(vm, key, result[key], function () {
          warn("Avoid mutating an injected value directly since the changes will be " + "overwritten whenever the provided component re-renders. " + "injection being mutated: \"" + key + "\"", vm);
        });
      } else {
        defineReactive$$1(vm, key, result[key]);
      }
    });
    toggleObserving(true);
  }
}

function resolveInject(inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]; // #6574 in case the inject object is observed...

      if (key === '__ob__') {
        continue;
      }

      var provideKey = inject[key].from;
      var source = vm;

      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break;
        }

        source = source.$parent;
      }

      if (!source) {
        if ('default' in inject[key]) {
          var provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function' ? provideDefault.call(vm) : provideDefault;
        } else if ("development" !== 'production') {
          warn("Injection \"" + key + "\" not found", vm);
        }
      }
    }

    return result;
  }
}
/*  */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */


function resolveSlots(children, context) {
  if (!children || !children.length) {
    return {};
  }

  var slots = {};

  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var data = child.data; // remove slot attribute if the node is resolved as a Vue slot node

    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    } // named slots should only be respected if the vnode was rendered in the
    // same context.


    if ((child.context === context || child.fnContext === context) && data && data.slot != null) {
      var name = data.slot;
      var slot = slots[name] || (slots[name] = []);

      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  } // ignore slots that contains only whitespace


  for (var name$1 in slots) {
    if (slots[name$1].every(isWhitespace)) {
      delete slots[name$1];
    }
  }

  return slots;
}

function isWhitespace(node) {
  return node.isComment && !node.asyncFactory || node.text === ' ';
}
/*  */


function normalizeScopedSlots(slots, normalSlots, prevSlots) {
  var res;
  var hasNormalSlots = Object.keys(normalSlots).length > 0;
  var isStable = slots ? !!slots.$stable : !hasNormalSlots;
  var key = slots && slots.$key;

  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized;
  } else if (isStable && prevSlots && prevSlots !== emptyObject && key === prevSlots.$key && !hasNormalSlots && !prevSlots.$hasNormal) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots;
  } else {
    res = {};

    for (var key$1 in slots) {
      if (slots[key$1] && key$1[0] !== '$') {
        res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
      }
    }
  } // expose normal slots on scopedSlots


  for (var key$2 in normalSlots) {
    if (!(key$2 in res)) {
      res[key$2] = proxyNormalSlot(normalSlots, key$2);
    }
  } // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error


  if (slots && Object.isExtensible(slots)) {
    slots._normalized = res;
  }

  def(res, '$stable', isStable);
  def(res, '$key', key);
  def(res, '$hasNormal', hasNormalSlots);
  return res;
}

function normalizeScopedSlot(normalSlots, key, fn) {
  var normalized = function () {
    var res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res) ? [res] // single vnode
    : normalizeChildren(res);
    return res && (res.length === 0 || res.length === 1 && res[0].isComment // #9658
    ) ? undefined : res;
  }; // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.


  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    });
  }

  return normalized;
}

function proxyNormalSlot(slots, key) {
  return function () {
    return slots[key];
  };
}
/*  */

/**
 * Runtime helper for rendering v-for lists.
 */


function renderList(val, render) {
  var ret, i, l, keys, key;

  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);

    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);

    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      var iterator = val[Symbol.iterator]();
      var result = iterator.next();

      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);

      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }

  if (!isDef(ret)) {
    ret = [];
  }

  ret._isVList = true;
  return ret;
}
/*  */

/**
 * Runtime helper for rendering <slot>
 */


function renderSlot(name, fallback, props, bindObject) {
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;

  if (scopedSlotFn) {
    // scoped slot
    props = props || {};

    if (bindObject) {
      if ("development" !== 'production' && !isObject(bindObject)) {
        warn('slot v-bind without argument expects an Object', this);
      }

      props = extend(extend({}, bindObject), props);
    }

    nodes = scopedSlotFn(props) || fallback;
  } else {
    nodes = this.$slots[name] || fallback;
  }

  var target = props && props.slot;

  if (target) {
    return this.$createElement('template', {
      slot: target
    }, nodes);
  } else {
    return nodes;
  }
}
/*  */

/**
 * Runtime helper for resolving filters
 */


function resolveFilter(id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity;
}
/*  */


function isKeyNotMatch(expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1;
  } else {
    return expect !== actual;
  }
}
/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */


function checkKeyCodes(eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) {
  var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;

  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName);
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode);
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key;
  }
}
/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */


function bindObjectProps(data, tag, value, asProp, isSync) {
  if (value) {
    if (!isObject(value)) {
      "development" !== 'production' && warn('v-bind without argument expects an Object or Array value', this);
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }

      var hash;

      var loop = function (key) {
        if (key === 'class' || key === 'style' || isReservedAttribute(key)) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key) ? data.domProps || (data.domProps = {}) : data.attrs || (data.attrs = {});
        }

        var camelizedKey = camelize(key);
        var hyphenatedKey = hyphenate(key);

        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});

            on["update:" + key] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop(key);
    }
  }

  return data;
}
/*  */

/**
 * Runtime helper for rendering static trees.
 */


function renderStatic(index, isInFor) {
  var cached = this._staticTrees || (this._staticTrees = []);
  var tree = cached[index]; // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.

  if (tree && !isInFor) {
    return tree;
  } // otherwise, render a fresh tree.


  tree = cached[index] = this.$options.staticRenderFns[index].call(this._renderProxy, null, this // for render fns generated for functional component templates
  );
  markStatic(tree, "__static__" + index, false);
  return tree;
}
/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */


function markOnce(tree, index, key) {
  markStatic(tree, "__once__" + index + (key ? "_" + key : ""), true);
  return tree;
}

function markStatic(tree, key, isOnce) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], key + "_" + i, isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode(node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}
/*  */


function bindObjectListeners(data, value) {
  if (value) {
    if (!isPlainObject(value)) {
      "development" !== 'production' && warn('v-on without argument expects an Object value', this);
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};

      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }

  return data;
}
/*  */


function resolveScopedSlots(fns, // see flow/vnode
res, // the following are added in 2.6
hasDynamicKeys, contentHashKey) {
  res = res || {
    $stable: !hasDynamicKeys
  };

  for (var i = 0; i < fns.length; i++) {
    var slot = fns[i];

    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys);
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true;
      }

      res[slot.key] = slot.fn;
    }
  }

  if (contentHashKey) {
    res.$key = contentHashKey;
  }

  return res;
}
/*  */


function bindDynamicKeys(baseObj, values) {
  for (var i = 0; i < values.length; i += 2) {
    var key = values[i];

    if (typeof key === 'string' && key) {
      baseObj[values[i]] = values[i + 1];
    } else if ("development" !== 'production' && key !== '' && key !== null) {
      // null is a speical value for explicitly removing a binding
      warn("Invalid value for dynamic directive argument (expected string or null): " + key, this);
    }
  }

  return baseObj;
} // helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.


function prependModifier(value, symbol) {
  return typeof value === 'string' ? symbol + value : value;
}
/*  */


function installRenderHelpers(target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}
/*  */


function FunctionalRenderContext(data, props, children, parent, Ctor) {
  var this$1 = this;
  var options = Ctor.options; // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check

  var contextVm;

  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent); // $flow-disable-line

    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent; // $flow-disable-line

    parent = parent._original;
  }

  var isCompiled = isTrue(options._compiled);
  var needNormalization = !isCompiled;
  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);

  this.slots = function () {
    if (!this$1.$slots) {
      normalizeScopedSlots(data.scopedSlots, this$1.$slots = resolveSlots(children, parent));
    }

    return this$1.$slots;
  };

  Object.defineProperty(this, 'scopedSlots', {
    enumerable: true,
    get: function get() {
      return normalizeScopedSlots(data.scopedSlots, this.slots());
    }
  }); // support for compiled functional template

  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options; // pre-resolve slots for renderSlot()

    this.$slots = this.slots();
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
  }

  if (options._scopeId) {
    this._c = function (a, b, c, d) {
      var vnode = createElement(contextVm, a, b, c, d, needNormalization);

      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }

      return vnode;
    };
  } else {
    this._c = function (a, b, c, d) {
      return createElement(contextVm, a, b, c, d, needNormalization);
    };
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent(Ctor, propsData, data, contextVm, children) {
  var options = Ctor.options;
  var props = {};
  var propOptions = options.props;

  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) {
      mergeProps(props, data.attrs);
    }

    if (isDef(data.props)) {
      mergeProps(props, data.props);
    }
  }

  var renderContext = new FunctionalRenderContext(data, props, children, contextVm, Ctor);
  var vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext);
  } else if (Array.isArray(vnode)) {
    var vnodes = normalizeChildren(vnode) || [];
    var res = new Array(vnodes.length);

    for (var i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
    }

    return res;
  }
}

function cloneAndMarkFunctionalResult(vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  var clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;

  if ("development" !== 'production') {
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
  }

  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }

  return clone;
}

function mergeProps(to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}
/*  */

/*  */

/*  */

/*  */
// inline hooks to be invoked on component VNodes during patch


var componentVNodeHooks = {
  init: function init(vnode, hydrating) {
    if (vnode.componentInstance && !vnode.componentInstance._isDestroyed && vnode.data.keepAlive) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow

      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      var child = vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance);
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },
  prepatch: function prepatch(oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(child, options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
    );
  },
  insert: function insert(vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;

    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }

    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true
        /* direct */
        );
      }
    }
  },
  destroy: function destroy(vnode) {
    var componentInstance = vnode.componentInstance;

    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true
        /* direct */
        );
      }
    }
  }
};
var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent(Ctor, data, context, children, tag) {
  if (isUndef(Ctor)) {
    return;
  }

  var baseCtor = context.$options._base; // plain options object: turn it into a constructor

  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  } // if at this stage it's not a constructor or an async component factory,
  // reject.


  if (typeof Ctor !== 'function') {
    if ("development" !== 'production') {
      warn("Invalid Component definition: " + String(Ctor), context);
    }

    return;
  } // async component


  var asyncFactory;

  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);

    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(asyncFactory, data, context, children, tag);
    }
  }

  data = data || {}; // resolve constructor options in case global mixins are applied after
  // component constructor creation

  resolveConstructorOptions(Ctor); // transform component v-model data into props & events

  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  } // extract props


  var propsData = extractPropsFromVNodeData(data, Ctor, tag); // functional component

  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children);
  } // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners


  var listeners = data.on; // replace with listeners with .native modifier
  // so it gets processed during parent component patch.

  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot
    // work around flow
    var slot = data.slot;
    data = {};

    if (slot) {
      data.slot = slot;
    }
  } // install component management hooks onto the placeholder node


  installComponentHooks(data); // return a placeholder vnode

  var name = Ctor.options.name || tag;
  var vnode = new VNode("vue-component-" + Ctor.cid + (name ? "-" + name : ''), data, undefined, undefined, undefined, context, {
    Ctor: Ctor,
    propsData: propsData,
    listeners: listeners,
    tag: tag,
    children: children
  }, asyncFactory);
  return vnode;
}

function createComponentInstanceForVnode(vnode, // we know it's MountedComponentVNode but flow doesn't
parent // activeInstance in lifecycle state
) {
  var options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent: parent
  }; // check inline-template render functions

  var inlineTemplate = vnode.data.inlineTemplate;

  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }

  return new vnode.componentOptions.Ctor(options);
}

function installComponentHooks(data) {
  var hooks = data.hook || (data.hook = {});

  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var existing = hooks[key];
    var toMerge = componentVNodeHooks[key];

    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook$1(f1, f2) {
  var merged = function (a, b) {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };

  merged._merged = true;
  return merged;
} // transform component v-model info (value and callback) into
// prop and event handler respectively.


function transformModel(options, data) {
  var prop = options.model && options.model.prop || 'value';
  var event = options.model && options.model.event || 'input';
  (data.attrs || (data.attrs = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  var existing = on[event];
  var callback = data.model.callback;

  if (isDef(existing)) {
    if (Array.isArray(existing) ? existing.indexOf(callback) === -1 : existing !== callback) {
      on[event] = [callback].concat(existing);
    }
  } else {
    on[event] = callback;
  }
}
/*  */


var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2; // wrapper function for providing a more flexible interface
// without getting yelled at by flow

function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }

  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }

  return _createElement(context, tag, data, children, normalizationType);
}

function _createElement(context, tag, data, children, normalizationType) {
  if (isDef(data) && isDef(data.__ob__)) {
    "development" !== 'production' && warn("Avoid using observed data object as vnode data: " + JSON.stringify(data) + "\n" + 'Always create fresh vnode data objects in each render!', context);
    return createEmptyVNode();
  } // object syntax in v-bind


  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }

  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode();
  } // warn against non-primitive key


  if ("development" !== 'production' && isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
    {
      warn('Avoid using non-primitive value as key, ' + 'use string/number value instead.', context);
    }
  } // support single function children as default scoped slot


  if (Array.isArray(children) && typeof children[0] === 'function') {
    data = data || {};
    data.scopedSlots = {
      default: children[0]
    };
    children.length = 0;
  }

  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }

  var vnode, ns;

  if (typeof tag === 'string') {
    var Ctor;
    ns = context.$vnode && context.$vnode.ns || config.getTagNamespace(tag);

    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(tag, data, children, undefined, undefined, context);
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }

  if (Array.isArray(vnode)) {
    return vnode;
  } else if (isDef(vnode)) {
    if (isDef(ns)) {
      applyNS(vnode, ns);
    }

    if (isDef(data)) {
      registerDeepBindings(data);
    }

    return vnode;
  } else {
    return createEmptyVNode();
  }
}

function applyNS(vnode, ns, force) {
  vnode.ns = ns;

  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }

  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];

      if (isDef(child.tag) && (isUndef(child.ns) || isTrue(force) && child.tag !== 'svg')) {
        applyNS(child, ns, force);
      }
    }
  }
} // ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes


function registerDeepBindings(data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }

  if (isObject(data.class)) {
    traverse(data.class);
  }
}
/*  */


function initRender(vm) {
  vm._vnode = null; // the root of the child tree

  vm._staticTrees = null; // v-once cached trees

  var options = vm.$options;
  var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree

  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject; // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates

  vm._c = function (a, b, c, d) {
    return createElement(vm, a, b, c, d, false);
  }; // normalization is always applied for the public version, used in
  // user-written render functions.


  vm.$createElement = function (a, b, c, d) {
    return createElement(vm, a, b, c, d, true);
  }; // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated


  var parentData = parentVnode && parentVnode.data;
  /* istanbul ignore else */

  if ("development" !== 'production') {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
  } else {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true);
    defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, null, true);
  }
}

var currentRenderingInstance = null;

function renderMixin(Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this);
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var _parentVnode = ref._parentVnode;

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(_parentVnode.data.scopedSlots, vm.$slots, vm.$scopedSlots);
    } // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.


    vm.$vnode = _parentVnode; // render self

    var vnode;

    try {
      // There's no need to maintain a stack becaues all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm;
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render"); // return error render result,
      // or previous vnode to prevent render error causing blank component

      /* istanbul ignore else */

      if ("development" !== 'production' && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
        } catch (e) {
          handleError(e, vm, "renderError");
          vnode = vm._vnode;
        }
      } else {
        vnode = vm._vnode;
      }
    } finally {
      currentRenderingInstance = null;
    } // if the returned array contains only a single node, allow it


    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    } // return empty vnode in case the render function errored out


    if (!(vnode instanceof VNode)) {
      if ("development" !== 'production' && Array.isArray(vnode)) {
        warn('Multiple root nodes returned from render function. Render function ' + 'should return a single root node.', vm);
      }

      vnode = createEmptyVNode();
    } // set parent


    vnode.parent = _parentVnode;
    return vnode;
  };
}
/*  */


function ensureCtor(comp, base) {
  if (comp.__esModule || hasSymbol && comp[Symbol.toStringTag] === 'Module') {
    comp = comp.default;
  }

  return isObject(comp) ? base.extend(comp) : comp;
}

function createAsyncPlaceholder(factory, data, context, children, tag) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = {
    data: data,
    context: context,
    children: children,
    tag: tag
  };
  return node;
}

function resolveAsyncComponent(factory, baseCtor) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp;
  }

  if (isDef(factory.resolved)) {
    return factory.resolved;
  }

  var owner = currentRenderingInstance;

  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner);
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp;
  }

  if (owner && !isDef(factory.owners)) {
    var owners = factory.owners = [owner];
    var sync = true;
    var timerLoading = null;
    var timerTimeout = null;
    owner.$on('hook:destroyed', function () {
      return remove(owners, owner);
    });

    var forceRender = function (renderCompleted) {
      for (var i = 0, l = owners.length; i < l; i++) {
        owners[i].$forceUpdate();
      }

      if (renderCompleted) {
        owners.length = 0;

        if (timerLoading !== null) {
          clearTimeout(timerLoading);
          timerLoading = null;
        }

        if (timerTimeout !== null) {
          clearTimeout(timerTimeout);
          timerTimeout = null;
        }
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor); // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)

      if (!sync) {
        forceRender(true);
      } else {
        owners.length = 0;
      }
    });
    var reject = once(function (reason) {
      "development" !== 'production' && warn("Failed to resolve async component: " + String(factory) + (reason ? "\nReason: " + reason : ''));

      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender(true);
      }
    });
    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (isPromise(res)) {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isPromise(res.component)) {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);

          if (res.delay === 0) {
            factory.loading = true;
          } else {
            timerLoading = setTimeout(function () {
              timerLoading = null;

              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender(false);
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(function () {
            timerTimeout = null;

            if (isUndef(factory.resolved)) {
              reject("development" !== 'production' ? "timeout (" + res.timeout + "ms)" : null);
            }
          }, res.timeout);
        }
      }
    }

    sync = false; // return in case resolved synchronously

    return factory.loading ? factory.loadingComp : factory.resolved;
  }
}
/*  */


function isAsyncPlaceholder(node) {
  return node.isComment && node.asyncFactory;
}
/*  */


function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];

      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c;
      }
    }
  }
}
/*  */

/*  */


function initEvents(vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false; // init parent attached events

  var listeners = vm.$options._parentListeners;

  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add(event, fn) {
  target.$on(event, fn);
}

function remove$1(event, fn) {
  target.$off(event, fn);
}

function createOnceHandler(event, fn) {
  var _target = target;
  return function onceHandler() {
    var res = fn.apply(null, arguments);

    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  };
}

function updateComponentListeners(vm, listeners, oldListeners) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
  target = undefined;
}

function eventsMixin(Vue) {
  var hookRE = /^hook:/;

  Vue.prototype.$on = function (event, fn) {
    var vm = this;

    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn); // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup

      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }

    return vm;
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;

    function on() {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }

    on.fn = fn;
    vm.$on(event, on);
    return vm;
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this; // all

    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm;
    } // array of events


    if (Array.isArray(event)) {
      for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
        vm.$off(event[i$1], fn);
      }

      return vm;
    } // specific event


    var cbs = vm._events[event];

    if (!cbs) {
      return vm;
    }

    if (!fn) {
      vm._events[event] = null;
      return vm;
    } // specific handler


    var cb;
    var i = cbs.length;

    while (i--) {
      cb = cbs[i];

      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }

    return vm;
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;

    if ("development" !== 'production') {
      var lowerCaseEvent = event.toLowerCase();

      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip("Event \"" + lowerCaseEvent + "\" is emitted in component " + formatComponentName(vm) + " but the handler is registered for \"" + event + "\". " + "Note that HTML attributes are case-insensitive and you cannot use " + "v-on to listen to camelCase events when using in-DOM templates. " + "You should probably use \"" + hyphenate(event) + "\" instead of \"" + event + "\".");
      }
    }

    var cbs = vm._events[event];

    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      var info = "event handler for \"" + event + "\"";

      for (var i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }

    return vm;
  };
}
/*  */


var activeInstance = null;
var isUpdatingChildComponent = false;

function setActiveInstance(vm) {
  var prevActiveInstance = activeInstance;
  activeInstance = vm;
  return function () {
    activeInstance = prevActiveInstance;
  };
}

function initLifecycle(vm) {
  var options = vm.$options; // locate first non-abstract parent

  var parent = options.parent;

  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }

    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;
  vm.$children = [];
  vm.$refs = {};
  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode; // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.

    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false
      /* removeOnly */
      );
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }

    restoreActiveInstance(); // update __vue__ reference

    if (prevEl) {
      prevEl.__vue__ = null;
    }

    if (vm.$el) {
      vm.$el.__vue__ = vm;
    } // if parent is an HOC, update its $el as well


    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    } // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.

  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;

    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;

    if (vm._isBeingDestroyed) {
      return;
    }

    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true; // remove self from parent

    var parent = vm.$parent;

    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    } // teardown watchers


    if (vm._watcher) {
      vm._watcher.teardown();
    }

    var i = vm._watchers.length;

    while (i--) {
      vm._watchers[i].teardown();
    } // remove reference from data ob
    // frozen object may not have observer.


    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    } // call the last hook...


    vm._isDestroyed = true; // invoke destroy hooks on current rendered tree

    vm.__patch__(vm._vnode, null); // fire destroyed hook


    callHook(vm, 'destroyed'); // turn off all instance listeners.

    vm.$off(); // remove __vue__ reference

    if (vm.$el) {
      vm.$el.__vue__ = null;
    } // release circular reference (#6759)


    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent(vm, el, hydrating) {
  vm.$el = el;

  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;

    if ("development" !== 'production') {
      /* istanbul ignore if */
      if (vm.$options.template && vm.$options.template.charAt(0) !== '#' || vm.$options.el || el) {
        warn('You are using the runtime-only build of Vue where the template ' + 'compiler is not available. Either pre-compile the templates into ' + 'render functions, or use the compiler-included build.', vm);
      } else {
        warn('Failed to mount component: template or render function not defined.', vm);
      }
    }
  }

  callHook(vm, 'beforeMount');
  var updateComponent;
  /* istanbul ignore if */

  if ("development" !== 'production' && config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;
      mark(startTag);

      var vnode = vm._render();

      mark(endTag);
      measure("vue " + name + " render", startTag, endTag);
      mark(startTag);

      vm._update(vnode, hydrating);

      mark(endTag);
      measure("vue " + name + " patch", startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  } // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined


  new Watcher(vm, updateComponent, noop, {
    before: function before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true
  /* isRenderWatcher */
  );
  hydrating = false; // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook

  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }

  return vm;
}

function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
  if ("development" !== 'production') {
    isUpdatingChildComponent = true;
  } // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.
  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.


  var newScopedSlots = parentVnode.data.scopedSlots;
  var oldScopedSlots = vm.$scopedSlots;
  var hasDynamicScopedSlot = !!(newScopedSlots && !newScopedSlots.$stable || oldScopedSlots !== emptyObject && !oldScopedSlots.$stable || newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key); // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.

  var needsForceUpdate = !!(renderChildren || // has new static slots
  vm.$options._renderChildren || // has old static slots
  hasDynamicScopedSlot);
  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) {
    // update child tree's parent
    vm._vnode.parent = parentVnode;
  }

  vm.$options._renderChildren = renderChildren; // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render

  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject; // update props

  if (propsData && vm.$options.props) {
    toggleObserving(false);
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];

    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      var propOptions = vm.$options.props; // wtf flow?

      props[key] = validateProp(key, propOptions, propsData, vm);
    }

    toggleObserving(true); // keep a copy of raw propsData

    vm.$options.propsData = propsData;
  } // update listeners


  listeners = listeners || emptyObject;
  var oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners); // resolve slots + force update if has children

  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  if ("development" !== 'production') {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree(vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) {
      return true;
    }
  }

  return false;
}

function activateChildComponent(vm, direct) {
  if (direct) {
    vm._directInactive = false;

    if (isInInactiveTree(vm)) {
      return;
    }
  } else if (vm._directInactive) {
    return;
  }

  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;

    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }

    callHook(vm, 'activated');
  }
}

function deactivateChildComponent(vm, direct) {
  if (direct) {
    vm._directInactive = true;

    if (isInInactiveTree(vm)) {
      return;
    }
  }

  if (!vm._inactive) {
    vm._inactive = true;

    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }

    callHook(vm, 'deactivated');
  }
}

function callHook(vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  var handlers = vm.$options[hook];
  var info = hook + " hook";

  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }

  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }

  popTarget();
}
/*  */


var MAX_UPDATE_COUNT = 100;
var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;
/**
 * Reset the scheduler's state.
 */

function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0;
  has = {};

  if ("development" !== 'production') {
    circular = {};
  }

  waiting = flushing = false;
} // Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.


var currentFlushTimestamp = 0; // Async edge case fix requires storing an event listener's attach timestamp.

var getNow = Date.now; // Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)

if (inBrowser && !isIE) {
  var performance = window.performance;

  if (performance && typeof performance.now === 'function' && getNow() > document.createEvent('Event').timeStamp) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = function () {
      return performance.now();
    };
  }
}
/**
 * Flush both queues and run the watchers.
 */


function flushSchedulerQueue() {
  currentFlushTimestamp = getNow();
  flushing = true;
  var watcher, id; // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.

  queue.sort(function (a, b) {
    return a.id - b.id;
  }); // do not cache length because more watchers might be pushed
  // as we run existing watchers

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];

    if (watcher.before) {
      watcher.before();
    }

    id = watcher.id;
    has[id] = null;
    watcher.run(); // in dev build, check and stop circular updates.

    if ("development" !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;

      if (circular[id] > MAX_UPDATE_COUNT) {
        warn('You may have an infinite update loop ' + (watcher.user ? "in watcher with expression \"" + watcher.expression + "\"" : "in a component render function."), watcher.vm);
        break;
      }
    }
  } // keep copies of post queues before resetting state


  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();
  resetSchedulerState(); // call component updated and activated hooks

  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue); // devtool hook

  /* istanbul ignore if */

  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks(queue) {
  var i = queue.length;

  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;

    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}
/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */


function queueActivatedComponent(vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks(queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true
    /* true */
    );
  }
}
/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */


function queueWatcher(watcher) {
  var id = watcher.id;

  if (has[id] == null) {
    has[id] = true;

    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;

      while (i > index && queue[i].id > watcher.id) {
        i--;
      }

      queue.splice(i + 1, 0, watcher);
    } // queue the flush


    if (!waiting) {
      waiting = true;

      if ("development" !== 'production' && !config.async) {
        flushSchedulerQueue();
        return;
      }

      nextTick(flushSchedulerQueue);
    }
  }
}
/*  */


var uid$2 = 0;
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */

var Watcher = function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
  this.vm = vm;

  if (isRenderWatcher) {
    vm._watcher = this;
  }

  vm._watchers.push(this); // options


  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.before = options.before;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }

  this.cb = cb;
  this.id = ++uid$2; // uid for batching

  this.active = true;
  this.dirty = this.lazy; // for lazy watchers

  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = "development" !== 'production' ? expOrFn.toString() : ''; // parse expression for getter

  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);

    if (!this.getter) {
      this.getter = noop;
      "development" !== 'production' && warn("Failed watching path: \"" + expOrFn + "\" " + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
    }
  }

  this.value = this.lazy ? undefined : this.get();
};
/**
 * Evaluate the getter, and re-collect dependencies.
 */


Watcher.prototype.get = function get() {
  pushTarget(this);
  var value;
  var vm = this.vm;

  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, "getter for watcher \"" + this.expression + "\"");
    } else {
      throw e;
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }

    popTarget();
    this.cleanupDeps();
  }

  return value;
};
/**
 * Add a dependency to this directive.
 */


Watcher.prototype.addDep = function addDep(dep) {
  var id = dep.id;

  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);

    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};
/**
 * Clean up for dependency collection.
 */


Watcher.prototype.cleanupDeps = function cleanupDeps() {
  var i = this.deps.length;

  while (i--) {
    var dep = this.deps[i];

    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }

  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};
/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */


Watcher.prototype.update = function update() {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};
/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */


Watcher.prototype.run = function run() {
  if (this.active) {
    var value = this.get();

    if (value !== this.value || // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated.
    isObject(value) || this.deep) {
      // set new value
      var oldValue = this.value;
      this.value = value;

      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, "callback for watcher \"" + this.expression + "\"");
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};
/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */


Watcher.prototype.evaluate = function evaluate() {
  this.value = this.get();
  this.dirty = false;
};
/**
 * Depend on all deps collected by this watcher.
 */


Watcher.prototype.depend = function depend() {
  var i = this.deps.length;

  while (i--) {
    this.deps[i].depend();
  }
};
/**
 * Remove self from all dependencies' subscriber list.
 */


Watcher.prototype.teardown = function teardown() {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }

    var i = this.deps.length;

    while (i--) {
      this.deps[i].removeSub(this);
    }

    this.active = false;
  }
};
/*  */


var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };

  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };

  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState(vm) {
  vm._watchers = [];
  var opts = vm.$options;

  if (opts.props) {
    initProps(vm, opts.props);
  }

  if (opts.methods) {
    initMethods(vm, opts.methods);
  }

  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true
    /* asRootData */
    );
  }

  if (opts.computed) {
    initComputed(vm, opts.computed);
  }

  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps(vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {}; // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.

  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent; // root instance props should be converted

  if (!isRoot) {
    toggleObserving(false);
  }

  var loop = function (key) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */

    if ("development" !== 'production') {
      var hyphenatedKey = hyphenate(key);

      if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) {
        warn("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop.", vm);
      }

      defineReactive$$1(props, key, value, function () {
        if (!isRoot && !isUpdatingChildComponent) {
          warn("Avoid mutating a prop directly since the value will be " + "overwritten whenever the parent component re-renders. " + "Instead, use a data or computed property based on the prop's " + "value. Prop being mutated: \"" + key + "\"", vm);
        }
      });
    } else {
      defineReactive$$1(props, key, value);
    } // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.


    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop(key);

  toggleObserving(true);
}

function initData(vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};

  if (!isPlainObject(data)) {
    data = {};
    "development" !== 'production' && warn('data functions should return an object:\n' + 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function', vm);
  } // proxy data on instance


  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;

  while (i--) {
    var key = keys[i];

    if ("development" !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn("Method \"" + key + "\" has already been defined as a data property.", vm);
      }
    }

    if (props && hasOwn(props, key)) {
      "development" !== 'production' && warn("The data property \"" + key + "\" is already declared as a prop. " + "Use prop default value instead.", vm);
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  } // observe data


  observe(data, true
  /* asRootData */
  );
}

function getData(data, vm) {
  // #7573 disable dep collection when invoking data getters
  pushTarget();

  try {
    return data.call(vm, vm);
  } catch (e) {
    handleError(e, vm, "data()");
    return {};
  } finally {
    popTarget();
  }
}

var computedWatcherOptions = {
  lazy: true
};

function initComputed(vm, computed) {
  // $flow-disable-line
  var watchers = vm._computedWatchers = Object.create(null); // computed properties are just getters during SSR

  var isSSR = isServerRendering();

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;

    if ("development" !== 'production' && getter == null) {
      warn("Getter is missing for computed property \"" + key + "\".", vm);
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);
    } // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.


    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if ("development" !== 'production') {
      if (key in vm.$data) {
        warn("The computed property \"" + key + "\" is already defined in data.", vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn("The computed property \"" + key + "\" is already defined as a prop.", vm);
      }
    }
  }
}

function defineComputed(target, key, userDef) {
  var shouldCache = !isServerRendering();

  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : createGetterInvoker(userDef.get) : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }

  if ("development" !== 'production' && sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn("Computed property \"" + key + "\" was assigned to but it has no setter.", this);
    };
  }

  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
  return function computedGetter() {
    var watcher = this._computedWatchers && this._computedWatchers[key];

    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }

      if (Dep.target) {
        watcher.depend();
      }

      return watcher.value;
    }
  };
}

function createGetterInvoker(fn) {
  return function computedGetter() {
    return fn.call(this, this);
  };
}

function initMethods(vm, methods) {
  var props = vm.$options.props;

  for (var key in methods) {
    if ("development" !== 'production') {
      if (typeof methods[key] !== 'function') {
        warn("Method \"" + key + "\" has type \"" + typeof methods[key] + "\" in the component definition. " + "Did you reference the function correctly?", vm);
      }

      if (props && hasOwn(props, key)) {
        warn("Method \"" + key + "\" has already been defined as a prop.", vm);
      }

      if (key in vm && isReserved(key)) {
        warn("Method \"" + key + "\" conflicts with an existing Vue instance method. " + "Avoid defining component methods that start with _ or $.");
      }
    }

    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initWatch(vm, watch) {
  for (var key in watch) {
    var handler = watch[key];

    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }

  if (typeof handler === 'string') {
    handler = vm[handler];
  }

  return vm.$watch(expOrFn, handler, options);
}

function stateMixin(Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};

  dataDef.get = function () {
    return this._data;
  };

  var propsDef = {};

  propsDef.get = function () {
    return this._props;
  };

  if ("development" !== 'production') {
    dataDef.set = function () {
      warn('Avoid replacing instance root $data. ' + 'Use nested data properties instead.', this);
    };

    propsDef.set = function () {
      warn("$props is readonly.", this);
    };
  }

  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);
  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;

    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options);
    }

    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);

    if (options.immediate) {
      try {
        cb.call(vm, watcher.value);
      } catch (error) {
        handleError(error, vm, "callback for immediate watcher \"" + watcher.expression + "\"");
      }
    }

    return function unwatchFn() {
      watcher.teardown();
    };
  };
}
/*  */


var uid$3 = 0;

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    var vm = this; // a uid

    vm._uid = uid$3++;
    var startTag, endTag;
    /* istanbul ignore if */

    if ("development" !== 'production' && config.performance && mark) {
      startTag = "vue-perf-start:" + vm._uid;
      endTag = "vue-perf-end:" + vm._uid;
      mark(startTag);
    } // a flag to avoid this being observed


    vm._isVue = true; // merge options

    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
    }
    /* istanbul ignore else */


    if ("development" !== 'production') {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    } // expose real self


    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props

    initState(vm);
    initProvide(vm); // resolve provide after data/props

    callHook(vm, 'created');
    /* istanbul ignore if */

    if ("development" !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure("vue " + vm._name + " init", startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent(vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options); // doing this because it's faster than dynamic enumeration.

  var parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;
  var vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions(Ctor) {
  var options = Ctor.options;

  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;

    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions; // check if there are any late-modified/attached options (#4976)

      var modifiedOptions = resolveModifiedOptions(Ctor); // update base extend options

      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }

      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);

      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }

  return options;
}

function resolveModifiedOptions(Ctor) {
  var modified;
  var latest = Ctor.options;
  var sealed = Ctor.sealedOptions;

  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) {
        modified = {};
      }

      modified[key] = latest[key];
    }
  }

  return modified;
}

function Vue(options) {
  if ("development" !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }

  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
/*  */

function initUse(Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = this._installedPlugins || (this._installedPlugins = []);

    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    } // additional parameters


    var args = toArray(arguments, 1);
    args.unshift(this);

    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }

    installedPlugins.push(plugin);
    return this;
  };
}
/*  */


function initMixin$1(Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
/*  */


function initExtend(Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;
  /**
   * Class inheritance
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});

    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId];
    }

    var name = extendOptions.name || Super.options.name;

    if ("development" !== 'production' && name) {
      validateComponentName(name);
    }

    var Sub = function VueComponent(options) {
      this._init(options);
    };

    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super; // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.

    if (Sub.options.props) {
      initProps$1(Sub);
    }

    if (Sub.options.computed) {
      initComputed$1(Sub);
    } // allow further extension/mixin/plugin usage


    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use; // create asset registers, so extended classes
    // can have their private assets too.

    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    }); // enable recursive self-lookup

    if (name) {
      Sub.options.components[name] = Sub;
    } // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.


    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options); // cache constructor

    cachedCtors[SuperId] = Sub;
    return Sub;
  };
}

function initProps$1(Comp) {
  var props = Comp.options.props;

  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1(Comp) {
  var computed = Comp.options.computed;

  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}
/*  */


function initAssetRegisters(Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if ("development" !== 'production' && type === 'component') {
          validateComponentName(id);
        }

        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }

        if (type === 'directive' && typeof definition === 'function') {
          definition = {
            bind: definition,
            update: definition
          };
        }

        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });
}
/*  */


function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag);
}

function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1;
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1;
  } else if (isRegExp(pattern)) {
    return pattern.test(name);
  }
  /* istanbul ignore next */


  return false;
}

function pruneCache(keepAliveInstance, filter) {
  var cache = keepAliveInstance.cache;
  var keys = keepAliveInstance.keys;
  var _vnode = keepAliveInstance._vnode;

  for (var key in cache) {
    var cachedNode = cache[key];

    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);

      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry(cache, key, keys, current) {
  var cached$$1 = cache[key];

  if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
    cached$$1.componentInstance.$destroy();
  }

  cache[key] = null;
  remove(keys, key);
}

var patternTypes = [String, RegExp, Array];
var KeepAlive = {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },
  created: function created() {
    this.cache = Object.create(null);
    this.keys = [];
  },
  destroyed: function destroyed() {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },
  mounted: function mounted() {
    var this$1 = this;
    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) {
        return matches(val, name);
      });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) {
        return !matches(val, name);
      });
    });
  },
  render: function render() {
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;

    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;

      if ( // not included
      include && (!name || !matches(include, name)) || // excluded
      exclude && name && matches(exclude, name)) {
        return vnode;
      }

      var ref$1 = this;
      var cache = ref$1.cache;
      var keys = ref$1.keys;
      var key = vnode.key == null // same constructor may get registered as different local components
      // so cid alone is not enough (#3269)
      ? componentOptions.Ctor.cid + (componentOptions.tag ? "::" + componentOptions.tag : '') : vnode.key;

      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance; // make current key freshest

        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key); // prune oldest entry

        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }

      vnode.data.keepAlive = true;
    }

    return vnode || slot && slot[0];
  }
};
var builtInComponents = {
  KeepAlive: KeepAlive
};
/*  */

function initGlobalAPI(Vue) {
  // config
  var configDef = {};

  configDef.get = function () {
    return config;
  };

  if ("development" !== 'production') {
    configDef.set = function () {
      warn('Do not replace the Vue.config object, set individual fields instead.');
    };
  }

  Object.defineProperty(Vue, 'config', configDef); // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.

  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive$$1
  };
  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick; // 2.6 explicit observable API

  Vue.observable = function (obj) {
    observe(obj);
    return obj;
  };

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  }); // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.

  Vue.options._base = Vue;
  extend(Vue.options.components, builtInComponents);
  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get: function get() {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext;
  }
}); // expose FunctionalRenderContext for ssr runtime helper installation

Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});
Vue.version = '2.6.10';
/*  */
// these are reserved for web because they are directly compiled away
// during template compilation

var isReservedAttr = makeMap('style,class'); // attributes that should be using props for binding

var acceptValue = makeMap('input,textarea,option,select,progress');

var mustUseProp = function (tag, type, attr) {
  return attr === 'value' && acceptValue(tag) && type !== 'button' || attr === 'selected' && tag === 'option' || attr === 'checked' && tag === 'input' || attr === 'muted' && tag === 'video';
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');
var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

var convertEnumeratedValue = function (key, value) {
  return isFalsyAttrValue(value) || value === 'false' ? 'false' // allow arbitrary string value for contenteditable
  : key === 'contenteditable' && isValidContentEditableValue(value) ? value : 'true';
};

var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' + 'required,reversed,scoped,seamless,selected,sortable,translate,' + 'truespeed,typemustmatch,visible');
var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : '';
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false;
};
/*  */


function genClassForVnode(vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;

  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;

    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }

  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }

  return renderClass(data.staticClass, data.class);
}

function mergeClassData(child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class) ? [child.class, parent.class] : parent.class
  };
}

function renderClass(staticClass, dynamicClass) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass));
  }
  /* istanbul ignore next */


  return '';
}

function concat(a, b) {
  return a ? b ? a + ' ' + b : a : b || '';
}

function stringifyClass(value) {
  if (Array.isArray(value)) {
    return stringifyArray(value);
  }

  if (isObject(value)) {
    return stringifyObject(value);
  }

  if (typeof value === 'string') {
    return value;
  }
  /* istanbul ignore next */


  return '';
}

function stringifyArray(value) {
  var res = '';
  var stringified;

  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) {
        res += ' ';
      }

      res += stringified;
    }
  }

  return res;
}

function stringifyObject(value) {
  var res = '';

  for (var key in value) {
    if (value[key]) {
      if (res) {
        res += ' ';
      }

      res += key;
    }
  }

  return res;
}
/*  */


var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};
var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title,' + 'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template,blockquote,iframe,tfoot'); // this map is intentionally selective, only covering SVG elements that may
// contain child elements.

var isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' + 'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' + 'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true);

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag);
};

function getTagNamespace(tag) {
  if (isSVG(tag)) {
    return 'svg';
  } // basic support for MathML
  // note it doesn't support other MathML elements being component roots


  if (tag === 'math') {
    return 'math';
  }
}

var unknownElementCache = Object.create(null);

function isUnknownElement(tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true;
  }

  if (isReservedTag(tag)) {
    return false;
  }

  tag = tag.toLowerCase();
  /* istanbul ignore if */

  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag];
  }

  var el = document.createElement(tag);

  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return unknownElementCache[tag] = el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
  } else {
    return unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString());
  }
}

var isTextInputType = makeMap('text,number,password,search,email,tel,url');
/*  */

/**
 * Query an element selector if it's not an element already.
 */

function query(el) {
  if (typeof el === 'string') {
    var selected = document.querySelector(el);

    if (!selected) {
      "development" !== 'production' && warn('Cannot find element: ' + el);
      return document.createElement('div');
    }

    return selected;
  } else {
    return el;
  }
}
/*  */


function createElement$1(tagName, vnode) {
  var elm = document.createElement(tagName);

  if (tagName !== 'select') {
    return elm;
  } // false or null will remove the attribute but undefined will not


  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }

  return elm;
}

function createElementNS(namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName);
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function createComment(text) {
  return document.createComment(text);
}

function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node, child) {
  node.removeChild(child);
}

function appendChild(node, child) {
  node.appendChild(child);
}

function parentNode(node) {
  return node.parentNode;
}

function nextSibling(node) {
  return node.nextSibling;
}

function tagName(node) {
  return node.tagName;
}

function setTextContent(node, text) {
  node.textContent = text;
}

function setStyleScope(node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps =
/*#__PURE__*/
Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setStyleScope: setStyleScope
});
/*  */

var ref = {
  create: function create(_, vnode) {
    registerRef(vnode);
  },
  update: function update(oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy(vnode) {
    registerRef(vnode, true);
  }
};

function registerRef(vnode, isRemoval) {
  var key = vnode.data.ref;

  if (!isDef(key)) {
    return;
  }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;

  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}
/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */


var emptyNode = new VNode('', {}, []);
var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode(a, b) {
  return a.key === b.key && (a.tag === b.tag && a.isComment === b.isComment && isDef(a.data) === isDef(b.data) && sameInputType(a, b) || isTrue(a.isAsyncPlaceholder) && a.asyncFactory === b.asyncFactory && isUndef(b.asyncFactory.error));
}

function sameInputType(a, b) {
  if (a.tag !== 'input') {
    return true;
  }

  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB);
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, key;
  var map = {};

  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;

    if (isDef(key)) {
      map[key] = i;
    }
  }

  return map;
}

function createPatchFunction(backend) {
  var i, j;
  var cbs = {};
  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];

    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt(elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    function remove$$1() {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }

    remove$$1.listeners = listeners;
    return remove$$1;
  }

  function removeNode(el) {
    var parent = nodeOps.parentNode(el); // element may have already been removed due to v-html / v-text

    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function isUnknownElement$$1(vnode, inVPre) {
    return !inVPre && !vnode.ns && !(config.ignoredElements.length && config.ignoredElements.some(function (ignore) {
      return isRegExp(ignore) ? ignore.test(vnode.tag) : ignore === vnode.tag;
    })) && config.isUnknownElement(vnode.tag);
  }

  var creatingElmInVPre = 0;

  function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    vnode.isRootInsert = !nested; // for transition enter check

    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return;
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;

    if (isDef(tag)) {
      if ("development" !== 'production') {
        if (data && data.pre) {
          creatingElmInVPre++;
        }

        if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.', vnode.context);
        }
      }

      vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag, vnode);
      setScope(vnode);
      /* istanbul ignore if */

      {
        createChildren(vnode, children, insertedVnodeQueue);

        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }

        insert(parentElm, vnode.elm, refElm);
      }

      if ("development" !== 'production' && data && data.pre) {
        creatingElmInVPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;

    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;

      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false
        /* hydrating */
        );
      } // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.


      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);

        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }

        return true;
      }
    }
  }

  function initComponent(vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }

    vnode.elm = vnode.componentInstance.$el;

    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode); // make sure to invoke the insert hook

      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    var i; // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.

    var innerNode = vnode;

    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;

      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }

        insertedVnodeQueue.push(innerNode);
        break;
      }
    } // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself


    insert(parentElm, vnode.elm, refElm);
  }

  function insert(parent, elm, ref$$1) {
    if (isDef(parent)) {
      if (isDef(ref$$1)) {
        if (nodeOps.parentNode(ref$$1) === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren(vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if ("development" !== 'production') {
        checkDuplicateKeys(children);
      }

      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable(vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }

    return isDef(vnode.tag);
  }

  function invokeCreateHooks(vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }

    i = vnode.data.hook; // Reuse variable

    if (isDef(i)) {
      if (isDef(i.create)) {
        i.create(emptyNode, vnode);
      }

      if (isDef(i.insert)) {
        insertedVnodeQueue.push(vnode);
      }
    }
  } // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.


  function setScope(vnode) {
    var i;

    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      var ancestor = vnode;

      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }

        ancestor = ancestor.parent;
      }
    } // for slot content they should also get the scopeId from the host instance.


    if (isDef(i = activeInstance) && i !== vnode.context && i !== vnode.fnContext && isDef(i = i.$options._scopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook(vnode) {
    var i, j;
    var data = vnode.data;

    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) {
        i(vnode);
      }

      for (i = 0; i < cbs.destroy.length; ++i) {
        cbs.destroy[i](vnode);
      }
    }

    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];

      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else {
          // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook(vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;

      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      } // recursively invoke hooks on child component root node


      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }

      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }

      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, vnodeToMove, refElm; // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions

    var canMove = !removeOnly;

    if ("development" !== 'production') {
      checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }

        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);

        if (isUndef(idxInOld)) {
          // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          vnodeToMove = oldCh[idxInOld];

          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }

        newStartVnode = newCh[++newStartIdx];
      }
    }

    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys(children) {
    var seenKeys = {};

    for (var i = 0; i < children.length; i++) {
      var vnode = children[i];
      var key = vnode.key;

      if (isDef(key)) {
        if (seenKeys[key]) {
          warn("Duplicate keys detected: '" + key + "'. This may cause an update error.", vnode.context);
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld(node, oldCh, start, end) {
    for (var i = start; i < end; i++) {
      var c = oldCh[i];

      if (isDef(c) && sameVnode(node, c)) {
        return i;
      }
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue, ownerArray, index, removeOnly) {
    if (oldVnode === vnode) {
      return;
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }

      return;
    } // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.


    if (isTrue(vnode.isStatic) && isTrue(oldVnode.isStatic) && vnode.key === oldVnode.key && (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
      vnode.componentInstance = oldVnode.componentInstance;
      return;
    }

    var i;
    var data = vnode.data;

    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;

    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) {
        cbs.update[i](oldVnode, vnode);
      }

      if (isDef(i = data.hook) && isDef(i = i.update)) {
        i(oldVnode, vnode);
      }
    }

    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) {
          updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
        }
      } else if (isDef(ch)) {
        if ("development" !== 'production') {
          checkDuplicateKeys(ch);
        }

        if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }

        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }

    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) {
        i(oldVnode, vnode);
      }
    }
  }

  function invokeInsertHook(vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var hydrationBailed = false; // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).

  var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key'); // Note: this is a browser-only function so we can assume elms are DOM nodes.

  function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
    var i;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    inVPre = inVPre || data && data.pre;
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true;
    } // assert node match


    if ("development" !== 'production') {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false;
      }
    }

    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode, true
        /* hydrating */
        );
      }

      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true;
      }
    }

    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if ("development" !== 'production' && typeof console !== 'undefined' && !hydrationBailed) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('server innerHTML: ', i);
                console.warn('client innerHTML: ', elm.innerHTML);
              }

              return false;
            }
          } else {
            // iterate and compare children lists
            var childrenMatch = true;
            var childNode = elm.firstChild;

            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break;
              }

              childNode = childNode.nextSibling;
            } // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.


            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if ("development" !== 'production' && typeof console !== 'undefined' && !hydrationBailed) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
              }

              return false;
            }
          }
        }
      }

      if (isDef(data)) {
        var fullInvoke = false;

        for (var key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break;
          }
        }

        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }

    return true;
  }

  function assertNodeMatch(node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || !isUnknownElement$$1(vnode, inVPre) && vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase());
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3);
    }
  }

  return function patch(oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) {
        invokeDestroyHook(oldVnode);
      }

      return;
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);

      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }

          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode;
            } else if ("development" !== 'production') {
              warn('The client-side rendered virtual DOM tree is not matching ' + 'server-rendered content. This is likely caused by incorrect ' + 'HTML markup, for example nesting block-level elements inside ' + '<p>, or missing <tbody>. Bailing hydration and performing ' + 'full client-side render.');
            }
          } // either not server-rendered, or hydration failed.
          // create an empty node and replace it


          oldVnode = emptyNodeAt(oldVnode);
        } // replacing existing element


        var oldElm = oldVnode.elm;
        var parentElm = nodeOps.parentNode(oldElm); // create new node

        createElm(vnode, insertedVnodeQueue, // extremely rare edge case: do not insert if old element is in a
        // leaving transition. Only happens when combining transition +
        // keep-alive + HOCs. (#4590)
        oldElm._leaveCb ? null : parentElm, nodeOps.nextSibling(oldElm)); // update parent placeholder node element, recursively

        if (isDef(vnode.parent)) {
          var ancestor = vnode.parent;
          var patchable = isPatchable(vnode);

          while (ancestor) {
            for (var i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }

            ancestor.elm = vnode.elm;

            if (patchable) {
              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, ancestor);
              } // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.


              var insert = ancestor.data.hook.insert;

              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                  insert.fns[i$2]();
                }
              }
            } else {
              registerRef(ancestor);
            }

            ancestor = ancestor.parent;
          }
        } // destroy old node


        if (isDef(parentElm)) {
          removeVnodes(parentElm, [oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm;
  };
}
/*  */


var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives(vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives(oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update(oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);
  var dirsWithInsert = [];
  var dirsWithPostpatch = [];
  var key, oldDir, dir;

  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];

    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);

      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      dir.oldArg = oldDir.arg;
      callHook$1(dir, 'update', vnode, oldVnode);

      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };

    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1(dirs, vm) {
  var res = Object.create(null);

  if (!dirs) {
    // $flow-disable-line
    return res;
  }

  var i, dir;

  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];

    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }

    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  } // $flow-disable-line


  return res;
}

function getRawDirName(dir) {
  return dir.rawName || dir.name + "." + Object.keys(dir.modifiers || {}).join('.');
}

function callHook$1(dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];

  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, "directive " + dir.name + " " + hook + " hook");
    }
  }
}

var baseModules = [ref, directives];
/*  */

function updateAttrs(oldVnode, vnode) {
  var opts = vnode.componentOptions;

  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return;
  }

  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return;
  }

  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {}; // clone observed objects, as the user probably wants to mutate it

  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];

    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  } // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max

  /* istanbul ignore if */


  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }

  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr(el, key, value) {
  if (el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value);
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED' ? 'true' : key;
      el.setAttribute(key, value);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value));
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    baseSetAttr(el, key, value);
  }
}

function baseSetAttr(el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.

    /* istanbul ignore if */
    if (isIE && !isIE9 && el.tagName === 'TEXTAREA' && key === 'placeholder' && value !== '' && !el.__ieph) {
      var blocker = function (e) {
        e.stopImmediatePropagation();
        el.removeEventListener('input', blocker);
      };

      el.addEventListener('input', blocker); // $flow-disable-line

      el.__ieph = true;
      /* IE placeholder patched */
    }

    el.setAttribute(key, value);
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};
/*  */

function updateClass(oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticClass) && isUndef(data.class) && (isUndef(oldData) || isUndef(oldData.staticClass) && isUndef(oldData.class))) {
    return;
  }

  var cls = genClassForVnode(vnode); // handle transition classes

  var transitionClass = el._transitionClasses;

  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  } // set the class


  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};
/*  */

/*  */

/*  */

/*  */
// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.

var RANGE_TOKEN = '__r';
var CHECKBOX_RADIO_TOKEN = '__c';
/*  */
// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.

function normalizeEvents(on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    var event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  } // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4

  /* istanbul ignore if */


  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

var target$1;

function createOnceHandler$1(event, handler, capture) {
  var _target = target$1; // save current target element in closure

  return function onceHandler() {
    var res = handler.apply(null, arguments);

    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  };
} // #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
// implementation and does not fire microtasks in between event propagation, so
// safe to exclude.


var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

function add$1(name, handler, capture, passive) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    var attachedTimestamp = currentFlushTimestamp;
    var original = handler;

    handler = original._wrapper = function (e) {
      if ( // no bubbling, should always fire.
      // this is just a safety net in case event.timeStamp is unreliable in
      // certain weird environments...
      e.target === e.currentTarget || // event is fired after handler attachment
      e.timeStamp >= attachedTimestamp || // bail for environments that have buggy event.timeStamp implementations
      // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
      // #9681 QtWebEngine event.timeStamp is negative value
      e.timeStamp <= 0 || // #9448 bail if event is fired in another document in a multi-page
      // electron/nw.js app, since event.timeStamp will be using a different
      // starting reference
      e.target.ownerDocument !== document) {
        return original.apply(this, arguments);
      }
    };
  }

  target$1.addEventListener(name, handler, supportsPassive ? {
    capture: capture,
    passive: passive
  } : capture);
}

function remove$2(name, handler, capture, _target) {
  (_target || target$1).removeEventListener(name, handler._wrapper || handler, capture);
}

function updateDOMListeners(oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return;
  }

  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};
/*  */

var svgContainer;

function updateDOMProps(oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return;
  }

  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {}; // clone observed objects, as the user probably wants to mutate it

  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = '';
    }
  }

  for (key in props) {
    cur = props[key]; // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)

    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) {
        vnode.children.length = 0;
      }

      if (cur === oldProps[key]) {
        continue;
      } // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property


      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0]);
      }
    }

    if (key === 'value' && elm.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur; // avoid resetting cursor position when value is the same

      var strCur = isUndef(cur) ? '' : String(cur);

      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
      // IE doesn't support innerHTML for SVG elements
      svgContainer = svgContainer || document.createElement('div');
      svgContainer.innerHTML = "<svg>" + cur + "</svg>";
      var svg = svgContainer.firstChild;

      while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
      }

      while (svg.firstChild) {
        elm.appendChild(svg.firstChild);
      }
    } else if ( // skip the update if old and new VDOM state is the same.
    // `value` is handled separately because the DOM value may be temporarily
    // out of sync with VDOM state due to focus, composition and modifiers.
    // This  #4521 by skipping the unnecesarry `checked` update.
    cur !== oldProps[key]) {
      // some property updates can throw
      // e.g. `value` on <progress> w/ non-finite value
      try {
        elm[key] = cur;
      } catch (e) {}
    }
  }
} // check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue(elm, checkVal) {
  return !elm.composing && (elm.tagName === 'OPTION' || isNotInFocusAndDirty(elm, checkVal) || isDirtyWithModifiers(elm, checkVal));
}

function isNotInFocusAndDirty(elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  var notInFocus = true; // #6157
  // work around IE bug when accessing document.activeElement in an iframe

  try {
    notInFocus = document.activeElement !== elm;
  } catch (e) {}

  return notInFocus && elm.value !== checkVal;
}

function isDirtyWithModifiers(elm, newVal) {
  var value = elm.value;
  var modifiers = elm._vModifiers; // injected by v-model runtime

  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal);
    }

    if (modifiers.trim) {
      return value.trim() !== newVal.trim();
    }
  }

  return value !== newVal;
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};
/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res;
}); // merge static and dynamic style data on the same vnode

function normalizeStyleData(data) {
  var style = normalizeStyleBinding(data.style); // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it

  return data.staticStyle ? extend(data.staticStyle, style) : style;
} // normalize possible array / string values into Object


function normalizeStyleBinding(bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle);
  }

  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle);
  }

  return bindingStyle;
}
/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */


function getStyle(vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;

    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;

      if (childNode && childNode.data && (styleData = normalizeStyleData(childNode.data))) {
        extend(res, styleData);
      }
    }
  }

  if (styleData = normalizeStyleData(vnode.data)) {
    extend(res, styleData);
  }

  var parentNode = vnode;

  while (parentNode = parentNode.parent) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }

  return res;
}
/*  */


var cssVarRE = /^--/;
var importantRE = /\s*!important$/;

var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
  } else {
    var normalizedName = normalize(name);

    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (var i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

var vendorNames = ['Webkit', 'Moz', 'ms'];
var emptyStyle;
var normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);

  if (prop !== 'filter' && prop in emptyStyle) {
    return prop;
  }

  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);

  for (var i = 0; i < vendorNames.length; i++) {
    var name = vendorNames[i] + capName;

    if (name in emptyStyle) {
      return name;
    }
  }
});

function updateStyle(oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) && isUndef(oldData.staticStyle) && isUndef(oldData.style)) {
    return;
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldData.staticStyle;
  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {}; // if static style exists, stylebinding already merged into it when doing normalizeStyleData

  var oldStyle = oldStaticStyle || oldStyleBinding;
  var style = normalizeStyleBinding(vnode.data.style) || {}; // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likely wants
  // to mutate it.

  vnode.data.normalizedStyle = isDef(style.__ob__) ? extend({}, style) : style;
  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }

  for (name in newStyle) {
    cur = newStyle[name];

    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};
/*  */

var whitespaceRE = /\s+/;
/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */

function addClass(el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return;
  }
  /* istanbul ignore else */


  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) {
        return el.classList.add(c);
      });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";

    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}
/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */


function removeClass(el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return;
  }
  /* istanbul ignore else */


  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) {
        return el.classList.remove(c);
      });
    } else {
      el.classList.remove(cls);
    }

    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';

    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }

    cur = cur.trim();

    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}
/*  */


function resolveTransition(def$$1) {
  if (!def$$1) {
    return;
  }
  /* istanbul ignore else */


  if (typeof def$$1 === 'object') {
    var res = {};

    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }

    extend(res, def$$1);
    return res;
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1);
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: name + "-enter",
    enterToClass: name + "-enter-to",
    enterActiveClass: name + "-enter-active",
    leaveClass: name + "-leave",
    leaveToClass: name + "-leave-to",
    leaveActiveClass: name + "-leave-active"
  };
});
var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation'; // Transition property/event sniffing

var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';

if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }

  if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
} // binding to window is necessary to make hot reload work in IE in strict mode


var raf = inBrowser ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout :
/* istanbul ignore next */
function (fn) {
  return fn();
};

function nextFrame(fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass(el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);

  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass(el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }

  removeClass(el, cls);
}

function whenTransitionEnds(el, expectedType, cb) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;

  if (!type) {
    return cb();
  }

  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;

  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };

  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };

  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo(el, expectedType) {
  var styles = window.getComputedStyle(el); // JSDOM may return undefined for transition properties

  var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
  var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
  var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);
  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */

  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }

  var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  };
}

function getTimeout(delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i]);
  }));
} // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors


function toMs(s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000;
}
/*  */


function enter(vnode, toggleDisplay) {
  var el = vnode.elm; // call leave callback now

  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;

    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);

  if (isUndef(data)) {
    return;
  }
  /* istanbul ignore if */


  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return;
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration; // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.

  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;

  while (transitionNode && transitionNode.parent) {
    context = transitionNode.context;
    transitionNode = transitionNode.parent;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return;
  }

  var startClass = isAppear && appearClass ? appearClass : enterClass;
  var activeClass = isAppear && appearActiveClass ? appearActiveClass : enterActiveClass;
  var toClass = isAppear && appearToClass ? appearToClass : enterToClass;
  var beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
  var enterHook = isAppear ? typeof appear === 'function' ? appear : enter : enter;
  var afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
  var enterCancelledHook = isAppear ? appearCancelled || enterCancelled : enterCancelled;
  var explicitEnterDuration = toNumber(isObject(duration) ? duration.enter : duration);

  if ("development" !== 'production' && explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(enterHook);
  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }

    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }

      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }

    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];

      if (pendingNode && pendingNode.tag === vnode.tag && pendingNode.elm._leaveCb) {
        pendingNode.elm._leaveCb();
      }

      enterHook && enterHook(el, cb);
    });
  } // start enter transition


  beforeEnterHook && beforeEnterHook(el);

  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);

      if (!cb.cancelled) {
        addTransitionClass(el, toClass);

        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave(vnode, rm) {
  var el = vnode.elm; // call enter callback now

  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;

    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);

  if (isUndef(data) || el.nodeType !== 1) {
    return rm();
  }
  /* istanbul ignore if */


  if (isDef(el._leaveCb)) {
    return;
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;
  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(leave);
  var explicitLeaveDuration = toNumber(isObject(duration) ? duration.leave : duration);

  if ("development" !== 'production' && isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }

    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }

    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }

      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }

    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave() {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return;
    } // record leaving element


    if (!vnode.data.show && el.parentNode) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
    }

    beforeLeave && beforeLeave(el);

    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);

        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);

          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }

    leave && leave(el, cb);

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
} // only used in dev mode


function checkDuration(val, name, vnode) {
  if (typeof val !== 'number') {
    warn("<transition> explicit " + name + " duration is not a valid number - " + "got " + JSON.stringify(val) + ".", vnode.context);
  } else if (isNaN(val)) {
    warn("<transition> explicit " + name + " duration is NaN - " + 'the duration expression might be incorrect.', vnode.context);
  }
}

function isValidDuration(val) {
  return typeof val === 'number' && !isNaN(val);
}
/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */


function getHookArgumentsLength(fn) {
  if (isUndef(fn)) {
    return false;
  }

  var invokerFns = fn.fns;

  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(Array.isArray(invokerFns) ? invokerFns[0] : invokerFns);
  } else {
    return (fn._length || fn.length) > 1;
  }
}

function _enter(_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1(vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};
var platformModules = [attrs, klass, events, domProps, style, transition];
/*  */
// the directive module should be applied last, after all
// built-in modules have been applied.

var modules = platformModules.concat(baseModules);
var patch = createPatchFunction({
  nodeOps: nodeOps,
  modules: modules
});
/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */

if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;

    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var directive = {
  inserted: function inserted(el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', function () {
          directive.componentUpdated(el, binding, vnode);
        });
      } else {
        setSelected(el, binding, vnode.context);
      }

      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;

      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd); // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.

        el.addEventListener('change', onCompositionEnd);
        /* istanbul ignore if */

        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },
  componentUpdated: function componentUpdated(el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context); // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.

      var prevOptions = el._vOptions;
      var curOptions = el._vOptions = [].map.call(el.options, getValue);

      if (curOptions.some(function (o, i) {
        return !looseEqual(o, prevOptions[i]);
      })) {
        // trigger change event if
        // no matching option found for at least one value
        var needReset = el.multiple ? binding.value.some(function (v) {
          return hasNoMatchingOption(v, curOptions);
        }) : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);

        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  }
};

function setSelected(el, binding, vm) {
  actuallySetSelected(el, binding, vm);
  /* istanbul ignore if */

  if (isIE || isEdge) {
    setTimeout(function () {
      actuallySetSelected(el, binding, vm);
    }, 0);
  }
}

function actuallySetSelected(el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;

  if (isMultiple && !Array.isArray(value)) {
    "development" !== 'production' && warn("<select multiple v-model=\"" + binding.expression + "\"> " + "expects an Array value for its binding, but got " + Object.prototype.toString.call(value).slice(8, -1), vm);
    return;
  }

  var selected, option;

  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];

    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;

      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }

        return;
      }
    }
  }

  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption(value, options) {
  return options.every(function (o) {
    return !looseEqual(o, value);
  });
}

function getValue(option) {
  return '_value' in option ? option._value : option.value;
}

function onCompositionStart(e) {
  e.target.composing = true;
}

function onCompositionEnd(e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) {
    return;
  }

  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger(el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}
/*  */
// recursively search for possible transition defined inside the component root


function locateNode(vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition) ? locateNode(vnode.componentInstance._vnode) : vnode;
}

var show = {
  bind: function bind(el, ref, vnode) {
    var value = ref.value;
    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay = el.style.display === 'none' ? '' : el.style.display;

    if (value && transition$$1) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },
  update: function update(el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;
    /* istanbul ignore if */

    if (!value === !oldValue) {
      return;
    }

    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;

    if (transition$$1) {
      vnode.data.show = true;

      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },
  unbind: function unbind(el, binding, vnode, oldVnode, isDestroy) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};
var platformDirectives = {
  model: directive,
  show: show
};
/*  */

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
}; // in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered

function getRealChild(vnode) {
  var compOptions = vnode && vnode.componentOptions;

  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children));
  } else {
    return vnode;
  }
}

function extractTransitionData(comp) {
  var data = {};
  var options = comp.$options; // props

  for (var key in options.propsData) {
    data[key] = comp[key];
  } // events.
  // extract listeners and pass them directly to the transition methods


  var listeners = options._parentListeners;

  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }

  return data;
}

function placeholder(h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    });
  }
}

function hasParentTransition(vnode) {
  while (vnode = vnode.parent) {
    if (vnode.data.transition) {
      return true;
    }
  }
}

function isSameChild(child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag;
}

var isNotTextNode = function (c) {
  return c.tag || isAsyncPlaceholder(c);
};

var isVShowDirective = function (d) {
  return d.name === 'show';
};

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render: function render(h) {
    var this$1 = this;
    var children = this.$slots.default;

    if (!children) {
      return;
    } // filter out text nodes (possible whitespaces)


    children = children.filter(isNotTextNode);
    /* istanbul ignore if */

    if (!children.length) {
      return;
    } // warn multiple elements


    if ("development" !== 'production' && children.length > 1) {
      warn('<transition> can only be used on a single element. Use ' + '<transition-group> for lists.', this.$parent);
    }

    var mode = this.mode; // warn invalid mode

    if ("development" !== 'production' && mode && mode !== 'in-out' && mode !== 'out-in') {
      warn('invalid <transition> mode: ' + mode, this.$parent);
    }

    var rawChild = children[0]; // if this is a component root node and the component's
    // parent container node also has transition, skip.

    if (hasParentTransition(this.$vnode)) {
      return rawChild;
    } // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive


    var child = getRealChild(rawChild);
    /* istanbul ignore if */

    if (!child) {
      return rawChild;
    }

    if (this._leaving) {
      return placeholder(h, rawChild);
    } // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.


    var id = "__transition-" + this._uid + "-";
    child.key = child.key == null ? child.isComment ? id + 'comment' : id + child.tag : isPrimitive(child.key) ? String(child.key).indexOf(id) === 0 ? child.key : id + child.key : child.key;
    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild); // mark v-show
    // so that the transition module can hand over the control to the directive

    if (child.data.directives && child.data.directives.some(isVShowDirective)) {
      child.data.show = true;
    }

    if (oldChild && oldChild.data && !isSameChild(child, oldChild) && !isAsyncPlaceholder(oldChild) && // #6687 component root is a comment node
    !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data); // handle transition mode

      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild);
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild;
        }

        var delayedLeave;

        var performLeave = function () {
          delayedLeave();
        };

        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) {
          delayedLeave = leave;
        });
      }
    }

    return rawChild;
  }
};
/*  */

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);
delete props.mode;
var TransitionGroup = {
  props: props,
  beforeMount: function beforeMount() {
    var this$1 = this;
    var update = this._update;

    this._update = function (vnode, hydrating) {
      var restoreActiveInstance = setActiveInstance(this$1); // force removing pass

      this$1.__patch__(this$1._vnode, this$1.kept, false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
      );

      this$1._vnode = this$1.kept;
      restoreActiveInstance();
      update.call(this$1, vnode, hydrating);
    };
  },
  render: function render(h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];

      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c;
          (c.data || (c.data = {})).transition = transitionData;
        } else if ("development" !== 'production') {
          var opts = c.componentOptions;
          var name = opts ? opts.Ctor.options.name || opts.tag || '' : c.tag;
          warn("<transition-group> children must be keyed: <" + name + ">");
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];

      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();

        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }

      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children);
  },
  updated: function updated() {
    var children = this.prevChildren;
    var moveClass = this.moveClass || (this.name || 'v') + '-move';

    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return;
    } // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.


    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation); // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line

    this._reflow = document.body.offsetHeight;
    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
          if (e && e.target !== el) {
            return;
          }

          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },
  methods: {
    hasMove: function hasMove(el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false;
      }
      /* istanbul ignore if */


      if (this._hasMove) {
        return this._hasMove;
      } // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.


      var clone = el.cloneNode();

      if (el._transitionClasses) {
        el._transitionClasses.forEach(function (cls) {
          removeClass(clone, cls);
        });
      }

      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      var info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return this._hasMove = info.hasTransform;
    }
  }
};

function callPendingCbs(c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */


  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition(c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation(c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;

  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};
/*  */
// install platform specific utils

Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement; // install platform runtime directives & components

extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents); // install platform patch function

Vue.prototype.__patch__ = inBrowser ? patch : noop; // public mount method

Vue.prototype.$mount = function (el, hydrating) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
}; // devtools global hook

/* istanbul ignore next */


if (inBrowser) {
  setTimeout(function () {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      } else if ("development" !== 'production' && "development" !== 'test') {
        console[console.info ? 'info' : 'log']('Download the Vue Devtools extension for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
      }
    }

    if ("development" !== 'production' && "development" !== 'test' && config.productionTip !== false && typeof console !== 'undefined') {
      console[console.info ? 'info' : 'log']("You are running Vue in development mode.\n" + "Make sure to turn on production mode when deploying for production.\n" + "See more tips at https://vuejs.org/guide/deployment.html");
    }
  }, 0);
}
/*  */


var _default = Vue;
exports.default = _default;
},{}],"components/ProseMirror/Dialogs/Link.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
//
//
//
//
//
//
//
//
//
//
//
var _default = {
  fields: {
    href: {
      label: "URL",
      type: "text",
      icon: "url"
    }
  },
  data: function data() {
    return {
      link: {
        href: null
      }
    };
  },
  methods: {
    open: function open(href) {
      this.link.href = href;
      this.$refs.dialog.open();
    },
    submit: function submit() {
      this.$emit("submit", this.link.href);
      this.$refs.dialog.close();
    }
  }
};
exports.default = _default;
        var $a7c47c = exports.default || module.exports;
      
      if (typeof $a7c47c === 'function') {
        $a7c47c = $a7c47c.options;
      }
    
        /* template */
        Object.assign($a7c47c, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "k-dialog",
    { ref: "dialog", on: { submit: _vm.submit } },
    [
      _c("k-form", {
        ref: "linkForm",
        attrs: { fields: _vm.$options.fields },
        on: { submit: _vm.submit },
        model: {
          value: _vm.link,
          callback: function($$v) {
            _vm.link = $$v
          },
          expression: "link"
        }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$a7c47c', $a7c47c);
          } else {
            api.reload('$a7c47c', $a7c47c);
          }
        }

        
      }
    })();
},{"vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js":[function(require,module,exports) {
var bundle = require('./bundle-url');

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    link.remove();
  };

  newLink.href = link.href.split('?')[0] + '?' + Date.now();
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      if (bundle.getBaseURL(links[i].href) === bundle.getBundleURL()) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

module.exports = reloadCSS;
},{"./bundle-url":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"components/ProseMirror/Toolbar.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
//
//
//
//
//
//
//
//
//
//
//
//
var _default = {
  props: {
    marks: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    options: Object
  }
};
exports.default = _default;
        var $27d778 = exports.default || module.exports;
      
      if (typeof $27d778 === 'function') {
        $27d778 = $27d778.options;
      }
    
        /* template */
        Object.assign($27d778, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "k-editable-toolbar" },
    _vm._l(_vm.options, function(mark, markType) {
      return _c("k-button", {
        key: markType,
        class: {
          "k-editable-toolbar-button": true,
          "k-editable-toolbar-button-active": _vm.marks.includes(markType)
        },
        attrs: { icon: mark.spec.toolbar.icon },
        on: {
          mousedown: function($event) {
            $event.preventDefault()
            return _vm.$emit("option", mark.spec.toolbar)
          }
        }
      })
    }),
    1
  )
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$27d778', $27d778);
          } else {
            api.reload('$27d778', $27d778);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/ProseMirror/ProseMirror.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _prosemirrorState = require("prosemirror-state");

var _prosemirrorModel = require("prosemirror-model");

var _Document = _interopRequireDefault(require("./Editor/Document.js"));

var _View = _interopRequireDefault(require("./Editor/View.js"));

var _prosemirrorCommands = require("prosemirror-commands");

var _Utils = require("./Utils.js");

var _Link = _interopRequireDefault(require("./Dialogs/Link.vue"));

var _Toolbar = _interopRequireDefault(require("./Toolbar.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _default = {
  inheritAttrs: false,
  components: {
    "k-link-dialog": _Link.default,
    "k-editable-toolbar": _Toolbar.default
  },
  fields: {
    link: {
      href: {
        label: "URL",
        type: "text",
        icon: "url"
      }
    }
  },
  props: {
    content: String,
    breaks: Boolean,
    code: Boolean,
    spellcheck: Boolean,
    paste: {
      type: Function,
      default: function _default() {
        return function () {};
      }
    },
    placeholder: String,
    marks: {
      type: Array,
      default: function _default() {
        return ["bold", "code", "italic", "link", "strikeThrough", "underline"];
      }
    }
  },
  data: function data() {
    return {
      editor: null,
      toolbar: false
    };
  },
  mounted: function mounted() {
    this.editor = (0, _View.default)({
      breaks: this.breaks,
      code: this.code,
      content: this.content,
      element: this.$el,
      marks: this.marks,
      onUpdate: this.onUpdate,
      onSplit: this.onSplit,
      onBack: this.onBack,
      onBold: this.onBold,
      onConvert: this.onConvert,
      onItalic: this.onItalic,
      onNext: this.onNext,
      onPaste: this.onPaste,
      onPrev: this.onPrev,
      onEnter: this.onEnter,
      onSelect: this.onSelect,
      onShiftEnter: this.onShiftEnter,
      onShiftTab: this.onShiftTab,
      onStrikeThrough: this.onStrikeThrough,
      onTab: this.onTab,
      onUnderline: this.onUnderline
    });
    this.onUpdate();
  },
  destroyed: function destroyed() {
    this.editor.destroy();
  },
  methods: {
    addMark: function addMark(type, attrs) {
      var _this$selection = this.selection(),
          from = _this$selection.from,
          to = _this$selection.to;

      var mark = this.mark(type);

      if (mark) {
        return this.dispatch(this.tr().addMark(from, to, mark.create(attrs)));
      }
    },
    coordsAtPos: function coordsAtPos(pos) {
      return this.editor.coordsAtPos(pos);
    },
    coordsAtEnd: function coordsAtEnd() {
      return this.editor.coordsAtPos(this.cursorPositionAtEnd());
    },
    coordsAtStart: function coordsAtStart() {
      return this.editor.coordsAtPos(0);
    },
    coordsAtCursor: function coordsAtCursor() {
      return this.coordsAtPos(this.cursorPosition());
    },
    posAtCoords: function posAtCoords(coords) {
      return this.editor.posAtCoords(coords);
    },
    cursor: function cursor() {
      var _this$selection2 = this.selection(),
          $cursor = _this$selection2.$cursor;

      return $cursor;
    },
    cursorAtEnd: function cursorAtEnd() {
      var _this$selectionAtEnd = this.selectionAtEnd(),
          $cursor = _this$selectionAtEnd.$cursor;

      return $cursor;
    },
    cursorAtStart: function cursorAtStart() {
      var _this$selectionAtStar = this.selectionAtStart(),
          $cursor = _this$selectionAtStar.$cursor;

      return $cursor;
    },
    cursorPosition: function cursorPosition() {
      var $cursor = this.cursor();
      return $cursor ? $cursor.pos : 0;
    },
    cursorPositionAtEnd: function cursorPositionAtEnd() {
      var $cursor = this.cursorAtEnd();
      return $cursor ? $cursor.pos : 0;
    },
    cursorPositionAtStart: function cursorPositionAtStart() {
      return 0;
    },
    dispatch: function dispatch(tr) {
      this.editor.dispatch(tr);
    },
    doc: function doc() {
      return this.editor.state.doc;
    },
    focus: function focus(cursor) {
      var _this = this;

      if (cursor) {
        var selection = null;

        switch (cursor) {
          case "start":
            selection = _prosemirrorState.TextSelection.atStart(this.doc());
            break;

          case "end":
            selection = _prosemirrorState.TextSelection.atEnd(this.doc());
            break;

          default:
            try {
              selection = _prosemirrorState.TextSelection.near(this.doc().resolve(cursor));
            } catch (e) {
              selection = _prosemirrorState.TextSelection.atStart(this.doc());
            }

            break;
        }

        this.dispatch(this.tr().setSelection(selection));
      }

      setTimeout(function () {
        _this.editor.focus();
      }, 1);
    },
    getActiveMarks: function getActiveMarks() {
      return (0, _Utils.getActiveMarks)(this.editor.state.schema, this.editor.state, this.marks);
    },
    getMarkAttrs: function getMarkAttrs(type) {
      return (0, _Utils.getMarkAttrs)(this.state(), type);
    },
    hasFocus: function hasFocus() {
      return this.editor.hasFocus;
    },
    hasMark: function hasMark(type) {
      return this.editor.state.schema.marks[type] !== undefined;
    },
    htmlAtSelection: function htmlAtSelection(selection) {
      return this.nodeToHtml(this.nodeAtSelection(selection));
    },
    htmlBeforeCursor: function htmlBeforeCursor() {
      return this.htmlAtSelection(this.selectionBeforeCursor());
    },
    htmlAfterCursor: function htmlAfterCursor() {
      return this.htmlAtSelection(this.selectionAfterCursor());
    },
    insertBreak: function insertBreak() {
      if (this.breaks !== true) {
        return false;
      }

      this.dispatch(this.tr().replaceSelectionWith(this.schema().nodes.hard_break.create()).scrollIntoView());
    },
    insertHtml: function insertHtml(html) {
      var node = (0, _Document.default)(this.schema(), html);
      this.dispatch(this.tr().replaceSelectionWith(node).scrollIntoView());
    },
    insertLink: function insertLink(href) {
      if (!href) {
        this.removeMark("link");
      } else {
        this.addMark("link", {
          href: href
        });
      }
    },
    insertText: function insertText(text) {
      this.dispatch(this.tr().insertText(text).scrollIntoView());
    },
    isEmpty: function isEmpty() {
      return this.doc().content.size === 0;
    },
    isSelected: function isSelected() {
      var selection = this.selection();
      var end = this.cursorPositionAtEnd();
      return selection.from === 0 && selection.to === end;
    },
    link: function link() {
      var attrs = this.getMarkAttrs("link");
      this.$refs.link.open(attrs.href);
    },
    mark: function mark(type) {
      return this.editor.state.schema.marks[type];
    },
    nodeAtSelection: function nodeAtSelection(selection) {
      return this.doc().cut(selection.from, selection.to);
    },
    nodeToHtml: function nodeToHtml(node) {
      var result = _prosemirrorModel.DOMSerializer.fromSchema(this.editor.state.schema).serializeFragment(node);

      var dom = document.createElement("div");
      dom.append(result);
      return dom.innerHTML;
    },
    onBack: function onBack() {
      this.$emit("back", {
        html: this.htmlAfterCursor()
      });
    },
    onBold: function onBold() {
      this.toggleMark("bold");
    },
    onBlur: function onBlur() {
      this.toolbar = false;
      this.$emit("blur");
    },
    onConvert: function onConvert(type) {
      this.$emit("convert", type);
    },
    onEnter: function onEnter() {
      this.$emit("enter", event);
    },
    onFocus: function onFocus() {
      this.$emit("focus", event);
    },
    onInput: function onInput(html) {
      this.$emit("input", html);
    },
    onItalic: function onItalic() {
      this.toggleMark("italic");
    },
    onMarks: function onMarks(marks) {
      this.$emit("marks", marks);
    },
    onNext: function onNext() {
      this.$emit("next");
    },
    onOption: function onOption(option) {
      if (!this[option.action]) {
        return false;
      }

      var args = option.args || [];
      this[option.action].apply(this, _toConsumableArray(args));
    },
    onPaste: function onPaste(html) {
      this.$emit("paste", html);
    },
    onPrev: function onPrev() {
      this.$emit("prev");
    },
    onSelect: function onSelect() {
      var selection = this.editor.state.selection;

      if (selection.empty) {
        this.toolbar = false;
        this.$emit("deselect");
      } else {
        var toolbar = this.$refs.toolbar;

        if (!toolbar) {
          return false;
        }

        var from = selection.from,
            to = selection.to;
        var start = this.coordsAtPos(from);
        var end = this.coordsAtPos(to, true); // The box in which the tooltip is positioned, to use as base

        var box = this.$el.getBoundingClientRect();
        var el = toolbar.$el.getBoundingClientRect(); // Find a center-ish x position from the selection endpoints (when
        // crossing lines, end may be more to the left)

        var left = (start.left + end.left) / 2 - box.left;
        var bottom = Math.round(box.bottom - start.top);
        this.toolbar = {
          left: left,
          bottom: bottom,
          marks: this.getActiveMarks()
        };
        this.$emit("select");
      }
    },
    onShiftEnter: function onShiftEnter() {
      this.$emit("shiftEnter");
      this.insertBreak();
    },
    onShiftTab: function onShiftTab() {
      this.$emit("shiftTab");
    },
    onStrikeThrough: function onStrikeThrough() {
      this.toggleMark("strikeThrough");
    },
    onSplit: function onSplit() {
      this.$emit("split", {
        cursor: this.cursorPosition(),
        before: this.htmlBeforeCursor(),
        after: this.htmlAfterCursor()
      });
    },
    onTab: function onTab() {
      this.$emit("tab");
    },
    onUnderline: function onUnderline() {
      this.toggleMark("underline");
    },
    onUpdate: function onUpdate() {
      this.onInput(this.toHTML());
    },
    removeMark: function removeMark(type) {
      var _this$selection3 = this.selection(),
          from = _this$selection3.from,
          to = _this$selection3.to;

      var mark = this.mark(type);

      if (mark) {
        return this.dispatch(this.tr().removeMark(from, to, mark));
      }
    },
    schema: function schema() {
      return this.editor.state.schema;
    },
    selection: function selection() {
      return this.editor.state.selection;
    },
    selectionAtEnd: function selectionAtEnd() {
      return _prosemirrorState.TextSelection.atEnd(this.doc());
    },
    selectionAtStart: function selectionAtStart() {
      return _prosemirrorState.TextSelection.atStart(this.doc());
    },
    selectionBeforeCursor: function selectionBeforeCursor() {
      return new _prosemirrorState.TextSelection(this.doc().resolve(0), this.selection().$from);
    },
    selectionAfterCursor: function selectionAfterCursor() {
      return new _prosemirrorState.TextSelection(this.selection().$to, this.selectionAtEnd().$to);
    },
    state: function state() {
      return this.editor.state;
    },
    toggleMark: function toggleMark(type, attrs) {
      var mark = this.mark(type);

      if (mark) {
        (0, _prosemirrorCommands.toggleMark)(mark, attrs)(this.editor.state, this.editor.dispatch);
      }

      this.editor.focus();
    },
    toHTML: function toHTML() {
      return (0, _Utils.getHTML)(this.editor.state, this.code);
    },
    toJSON: function toJSON() {
      return this.doc().toJSON();
    },
    tr: function tr() {
      return this.editor.state.tr;
    },
    view: function view() {
      return this.editor;
    }
  }
};
exports.default = _default;
        var $052f50 = exports.default || module.exports;
      
      if (typeof $052f50 === 'function') {
        $052f50 = $052f50.options;
      }
    
        /* template */
        Object.assign($052f50, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      ref: "editor",
      staticClass: "k-editable",
      attrs: { spellcheck: _vm.spellcheck },
      on: { focusin: _vm.onFocus, focusout: _vm.onBlur }
    },
    [
      _vm.editor
        ? _c("k-editable-toolbar", {
            directives: [
              {
                name: "show",
                rawName: "v-show",
                value: _vm.toolbar,
                expression: "toolbar"
              }
            ],
            ref: "toolbar",
            style: {
              bottom: _vm.toolbar.bottom + "px",
              left: _vm.toolbar.left + "px"
            },
            attrs: {
              marks: _vm.toolbar.marks,
              options: _vm.editor.state.schema.marks
            },
            on: { option: _vm.onOption }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.placeholder && _vm.editor && _vm.isEmpty()
        ? _c("span", { staticClass: "k-editable-placeholder" }, [
            _vm._v(_vm._s(_vm.placeholder))
          ])
        : _vm._e(),
      _vm._v(" "),
      _c("k-link-dialog", { ref: "link", on: { submit: _vm.insertLink } })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$052f50', $052f50);
          } else {
            api.reload('$052f50', $052f50);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"prosemirror-state":"../node_modules/prosemirror-state/dist/index.js","prosemirror-model":"../node_modules/prosemirror-model/dist/index.js","./Editor/Document.js":"components/ProseMirror/Editor/Document.js","./Editor/View.js":"components/ProseMirror/Editor/View.js","prosemirror-commands":"../node_modules/prosemirror-commands/dist/commands.js","./Utils.js":"components/ProseMirror/Utils.js","./Dialogs/Link.vue":"components/ProseMirror/Dialogs/Link.vue","./Toolbar.vue":"components/ProseMirror/Toolbar.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/Options/Bold.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  icon: "bold",
  label: "Bold",
  type: "bold",
  action: "toggleMark",
  args: ["bold"]
};
exports.default = _default;
},{}],"components/Blocks/Options/Code.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  icon: "code",
  label: "Code",
  type: "code",
  action: "toggleMark",
  args: ["code"]
};
exports.default = _default;
},{}],"components/Blocks/Options/Italic.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  icon: "italic",
  label: "Italic",
  type: "italic",
  action: "toggleMark",
  args: ["italic"]
};
exports.default = _default;
},{}],"components/Blocks/Options/Link.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  icon: "url",
  label: "Link",
  type: "link",
  action: "link"
};
exports.default = _default;
},{}],"components/Blocks/Options/Underline.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  icon: "u",
  label: "Underline",
  type: "underline",
  action: "toggleMark",
  args: ["underline"]
};
exports.default = _default;
},{}],"components/Blocks/Options/StrikeThrough.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  icon: "s",
  label: "Strike-through",
  type: "strikeThrough",
  action: "toggleMark",
  args: ["strikeThrough"]
};
exports.default = _default;
},{}],"components/Blocks/Paragraph.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ProseMirror = _interopRequireDefault(require("../ProseMirror/ProseMirror.vue"));

var _Bold = _interopRequireDefault(require("./Options/Bold.js"));

var _Code = _interopRequireDefault(require("./Options/Code.js"));

var _Italic = _interopRequireDefault(require("./Options/Italic.js"));

var _Link = _interopRequireDefault(require("./Options/Link.js"));

var _Underline = _interopRequireDefault(require("./Options/Underline.js"));

var _StrikeThrough = _interopRequireDefault(require("./Options/StrikeThrough.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Marks */
var availableOptions = {
  bold: _Bold.default,
  code: _Code.default,
  italic: _Italic.default,
  link: _Link.default,
  strikeThrough: _StrikeThrough.default,
  underline: _Underline.default
};
var _default = {
  extends: _ProseMirror.default,
  append: "paragraph",
  label: "Text",
  icon: "text",
  breaks: true,
  code: false,
  marks: ['bold', 'italic', // 'strikeThrough',
  // 'underline',
  'code', 'link'],
  placeholder: null,
  props: {
    attrs: {
      type: Object,
      default: function _default() {
        return {};
      }
    }
  },
  methods: {
    menu: function menu(marks) {
      marks = marks || [];
      var menu = {};
      this.$options.marks.forEach(function (mark) {
        if (availableOptions[mark]) {
          menu[mark] = availableOptions[mark];
          menu[mark].isActive = marks.includes(mark);
        }
      });
      return menu;
    },
    onEnter: function onEnter() {
      this.$emit("append", {
        type: this.$options.append
      });
    },
    onInput: function onInput(html) {
      this.$emit("input", {
        content: html
      });
    },
    onMarks: function onMarks(marks) {
      var _this = this;

      this.$nextTick(function () {
        _this.$emit("menu", _this.menu(marks));
      });
    },
    onShiftTab: function onShiftTab() {
      this.$emit("prev");
    },
    onSplit: function onSplit() {
      var cursor = this.cursorPosition();

      if (cursor === 0) {
        this.$emit("prepend");
      } else {
        this.$emit("split", {
          cursor: cursor,
          before: this.htmlBeforeCursor(),
          after: this.htmlAfterCursor(),
          type: this.$options.append
        });
      }
    },
    onTab: function onTab() {
      this.$emit("next");
    }
  }
};
exports.default = _default;
        var $808715 = exports.default || module.exports;
      
      if (typeof $808715 === 'function') {
        $808715 = $808715.options;
      }
    
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$808715', $808715);
          } else {
            api.reload('$808715', $808715);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"../ProseMirror/ProseMirror.vue":"components/ProseMirror/ProseMirror.vue","./Options/Bold.js":"components/Blocks/Options/Bold.js","./Options/Code.js":"components/Blocks/Options/Code.js","./Options/Italic.js":"components/Blocks/Options/Italic.js","./Options/Link.js":"components/Blocks/Options/Link.js","./Options/Underline.js":"components/Blocks/Options/Underline.js","./Options/StrikeThrough.js":"components/Blocks/Options/StrikeThrough.js","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/Blockquote.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Paragraph = _interopRequireDefault(require("./Paragraph.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  label: "Quote",
  icon: "quote",
  extends: _Paragraph.default,
  breaks: true,
  placeholder: "Quote",
  marks: ['italic', 'code', 'link']
};
exports.default = _default;
        var $da70fe = exports.default || module.exports;
      
      if (typeof $da70fe === 'function') {
        $da70fe = $da70fe.options;
      }
    
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$da70fe', $da70fe);
          } else {
            api.reload('$da70fe', $da70fe);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./Paragraph.vue":"components/Blocks/Paragraph.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/Code.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Paragraph = _interopRequireDefault(require("./Paragraph.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  extends: _Paragraph.default,
  label: "Code",
  icon: "code",
  marks: [],
  code: true,
  breaks: false,
  methods: {
    insertBreak: function insertBreak() {
      this.dispatch(this.tr().insertText("\n").scrollIntoView());
    },
    onEnter: function onEnter() {
      this.insertBreak();
    },
    onShiftEnter: function onShiftEnter() {
      this.$emit("append");
    },
    onShiftTab: function onShiftTab() {},
    onTab: function onTab() {
      this.insertText("\t");
    },
    setLanguage: function setLanguage(language) {
      alert(language);
    }
  }
};
exports.default = _default;
        var $c30481 = exports.default || module.exports;
      
      if (typeof $c30481 === 'function') {
        $c30481 = $c30481.options;
      }
    
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$c30481', $c30481);
          } else {
            api.reload('$c30481', $c30481);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./Paragraph.vue":"components/Blocks/Paragraph.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/H1.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Paragraph = _interopRequireDefault(require("./Paragraph.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  extends: _Paragraph.default,
  icon: "title",
  label: "Heading 1",
  placeholder: "Heading 1",
  breaks: true,
  marks: ['italic', // 'strikeThrough',
  'code', 'link']
};
exports.default = _default;
        var $02f61e = exports.default || module.exports;
      
      if (typeof $02f61e === 'function') {
        $02f61e = $02f61e.options;
      }
    
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$02f61e', $02f61e);
          } else {
            api.reload('$02f61e', $02f61e);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./Paragraph.vue":"components/Blocks/Paragraph.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/H2.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _H = _interopRequireDefault(require("./H1.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = _objectSpread({}, _H.default, {
  label: "Heading 2",
  placeholder: "Heading 2"
});

exports.default = _default;
        var $4545d8 = exports.default || module.exports;
      
      if (typeof $4545d8 === 'function') {
        $4545d8 = $4545d8.options;
      }
    
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$4545d8', $4545d8);
          } else {
            api.reload('$4545d8', $4545d8);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./H1.vue":"components/Blocks/H1.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/H3.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _H = _interopRequireDefault(require("./H1.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = _objectSpread({}, _H.default, {
  label: "Heading 3",
  placeholder: "Heading 3"
});

exports.default = _default;
        var $0e26b0 = exports.default || module.exports;
      
      if (typeof $0e26b0 === 'function') {
        $0e26b0 = $0e26b0.options;
      }
    
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$0e26b0', $0e26b0);
          } else {
            api.reload('$0e26b0', $0e26b0);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./H1.vue":"components/Blocks/H1.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/Hr.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
//
//
//
//
//
//
//
//
//
//
//
//
var _default = {
  label: "Horizontal line",
  icon: "dots",
  methods: {
    focus: function focus() {
      this.$refs.hr.focus();
    }
  }
};
exports.default = _default;
        var $6ed629 = exports.default || module.exports;
      
      if (typeof $6ed629 === 'function') {
        $6ed629 = $6ed629.options;
      }
    
        /* template */
        Object.assign($6ed629, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("hr", {
    ref: "hr",
    staticClass: "k-editor-hr-block-divider",
    attrs: { tabindex: "0" },
    on: {
      keydown: [
        function($event) {
          if (
            !$event.type.indexOf("key") &&
            _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
          ) {
            return null
          }
          return _vm.$emit("append")
        },
        function($event) {
          if (
            !$event.type.indexOf("key") &&
            _vm._k($event.keyCode, "up", 38, $event.key, ["Up", "ArrowUp"])
          ) {
            return null
          }
          return _vm.$emit("prev")
        },
        function($event) {
          if (
            !$event.type.indexOf("key") &&
            _vm._k($event.keyCode, "down", 40, $event.key, [
              "Down",
              "ArrowDown"
            ])
          ) {
            return null
          }
          return _vm.$emit("next")
        },
        function($event) {
          if (
            !$event.type.indexOf("key") &&
            _vm._k($event.keyCode, "delete", [8, 46], $event.key, [
              "Backspace",
              "Delete",
              "Del"
            ])
          ) {
            return null
          }
          return _vm.$emit("remove")
        }
      ]
    }
  })
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$6ed629', $6ed629);
          } else {
            api.reload('$6ed629', $6ed629);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/Image.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var _default = {
  label: "Image",
  icon: "image",
  props: {
    endpoints: Object,
    attrs: {
      type: Object,
      default: function _default() {
        return {};
      }
    }
  },
  fields: {
    alt: {
      label: "Alt",
      type: "text"
    },
    caption: {
      label: "Caption",
      type: "textarea",
      buttons: false
    }
  },
  methods: {
    focus: function focus() {
      this.$refs.element.focus();
    },
    menu: function menu() {
      return {
        upload: {
          icon: "upload",
          label: "Upload",
          action: "selectFile"
        },
        text: {
          icon: "text",
          label: "Settings",
          action: "settings"
        }
      };
    },
    onAppend: function onAppend() {
      this.$emit("append");
    },
    input: function input(data) {
      var _this = this;

      this.$emit("input", {
        attrs: _objectSpread({}, this.attrs, data)
      });
      this.$nextTick(function () {
        _this.$emit("menu", _this.menu());
      });
    },
    insertFile: function insertFile(file) {
      this.input({
        src: file[0].url
      });
    },
    selectFile: function selectFile() {
      this.$refs.fileDialog.open({
        endpoint: this.endpoints.field + "/files",
        multiple: false
      });
    },
    settings: function settings() {
      this.$refs.settings.open();
    },
    saveSettings: function saveSettings() {
      this.$refs.settings.close();
    }
  }
};
exports.default = _default;
        var $c37f84 = exports.default || module.exports;
      
      if (typeof $c37f84 === 'function') {
        $c37f84 = $c37f84.options;
      }
    
        /* template */
        Object.assign($c37f84, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c(
        "figure",
        {
          ref: "figure",
          on: {
            keydown: [
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                ) {
                  return null
                }
                return _vm.onAppend($event)
              },
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k($event.keyCode, "up", 38, $event.key, [
                    "Up",
                    "ArrowUp"
                  ])
                ) {
                  return null
                }
                $event.preventDefault()
                return _vm.$emit("prev")
              },
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k($event.keyCode, "down", 40, $event.key, [
                    "Down",
                    "ArrowDown"
                  ])
                ) {
                  return null
                }
                $event.preventDefault()
                return _vm.$emit("next")
              },
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k($event.keyCode, "delete", [8, 46], $event.key, [
                    "Backspace",
                    "Delete",
                    "Del"
                  ])
                ) {
                  return null
                }
                return _vm.$emit("remove")
              }
            ]
          }
        },
        [
          _vm.attrs.src
            ? [
                _c(
                  "div",
                  { staticClass: "k-editor-image-block-wrapper" },
                  [
                    _c("k-button", {
                      staticClass: "k-editor-image-block-options",
                      attrs: { icon: "cog" },
                      on: { click: _vm.settings }
                    }),
                    _vm._v(" "),
                    _c("img", {
                      ref: "element",
                      attrs: { tabindex: "0", src: _vm.attrs.src },
                      on: { dblclick: _vm.selectFile }
                    })
                  ],
                  1
                ),
                _vm._v(" "),
                _vm.attrs.caption
                  ? _c("figcaption", { on: { dblclick: _vm.settings } }, [
                      _vm._v(
                        "\n        " + _vm._s(_vm.attrs.caption) + "\n      "
                      )
                    ])
                  : _vm._e()
              ]
            : [
                _c(
                  "div",
                  { staticClass: "k-editor-image-block-placeholder" },
                  [
                    _c(
                      "k-button",
                      {
                        ref: "element",
                        attrs: { icon: "image" },
                        on: { click: _vm.selectFile }
                      },
                      [_vm._v("Add an image")]
                    )
                  ],
                  1
                )
              ]
        ],
        2
      ),
      _vm._v(" "),
      _c("k-files-dialog", {
        ref: "fileDialog",
        on: {
          submit: function($event) {
            return _vm.insertFile($event)
          }
        }
      }),
      _vm._v(" "),
      _c("k-upload", { ref: "fileUpload", on: { success: _vm.insertUpload } }),
      _vm._v(" "),
      _c(
        "k-dialog",
        {
          ref: "settings",
          attrs: { size: "medium" },
          on: { submit: _vm.saveSettings }
        },
        [
          _c("k-form", {
            attrs: { fields: _vm.$options.fields },
            on: { submit: _vm.saveSettings },
            model: {
              value: _vm.attrs,
              callback: function($$v) {
                _vm.attrs = $$v
              },
              expression: "attrs"
            }
          })
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$c37f84', $c37f84);
          } else {
            api.reload('$c37f84', $c37f84);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/Ul.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Paragraph = _interopRequireDefault(require("./Paragraph.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  extends: _Paragraph.default,
  label: "Bulleted List",
  append: "ul",
  icon: "list-bullet",
  breaks: true,
  placeholder: "List",
  marks: ['bold', 'italic', 'code', 'link'],
  methods: {
    indent: function indent(_indent) {
      this.$emit("update", {
        attrs: {
          indent: _indent
        }
      });
    },
    onEnter: function onEnter() {
      if (this.isEmpty()) {
        this.$emit("convert", "paragraph");
      } else {
        this.$emit("append", {
          type: this.$options.append,
          attrs: {
            indent: this.attrs.indent || 0
          }
        });
      }
    }
  }
};
exports.default = _default;
        var $695456 = exports.default || module.exports;
      
      if (typeof $695456 === 'function') {
        $695456 = $695456.options;
      }
    
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$695456', $695456);
          } else {
            api.reload('$695456', $695456);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./Paragraph.vue":"components/Blocks/Paragraph.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/Ol.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Ul = _interopRequireDefault(require("./Ul.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = _objectSpread({}, _Ul.default, {
  label: "Ordered List",
  append: "ol",
  icon: "list-numbers"
});

exports.default = _default;
        var $711956 = exports.default || module.exports;
      
      if (typeof $711956 === 'function') {
        $711956 = $711956.options;
      }
    
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$711956', $711956);
          } else {
            api.reload('$711956', $711956);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./Ul.vue":"components/Blocks/Ul.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks/Video.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Image = _interopRequireDefault(require("./Image.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
function getId(url) {
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);

  if (match) {
    return "https://www.youtube.com/embed/" + match[2];
  } else {
    return false;
  }
}

var _default = {
  extends: _Image.default,
  label: "Video",
  icon: "video",
  fields: {
    src: {
      label: "Video-URL",
      type: "url"
    }
  },
  computed: {
    embedSrc: function embedSrc() {
      if (!this.attrs.src) {
        return null;
      }

      return getId(this.attrs.src);
    }
  },
  methods: {
    menu: function menu() {
      return {
        src: {
          icon: "url",
          label: "Link",
          action: "settings"
        }
      };
    }
  }
};
exports.default = _default;
        var $80ee04 = exports.default || module.exports;
      
      if (typeof $80ee04 === 'function') {
        $80ee04 = $80ee04.options;
      }
    
        /* template */
        Object.assign($80ee04, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c(
        "figure",
        {
          ref: "figure",
          on: {
            keydown: [
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                ) {
                  return null
                }
                return _vm.onAppend($event)
              },
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k($event.keyCode, "up", 38, $event.key, [
                    "Up",
                    "ArrowUp"
                  ])
                ) {
                  return null
                }
                $event.preventDefault()
                return _vm.$emit("prev")
              },
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k($event.keyCode, "down", 40, $event.key, [
                    "Down",
                    "ArrowDown"
                  ])
                ) {
                  return null
                }
                $event.preventDefault()
                return _vm.$emit("next")
              },
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k(
                    $event.keyCode,
                    "backspace",
                    undefined,
                    $event.key,
                    undefined
                  )
                ) {
                  return null
                }
                return _vm.$emit("remove")
              },
              function($event) {
                if (
                  !$event.type.indexOf("key") &&
                  _vm._k($event.keyCode, "delete", [8, 46], $event.key, [
                    "Backspace",
                    "Delete",
                    "Del"
                  ])
                ) {
                  return null
                }
                return _vm.$emit("remove")
              }
            ]
          }
        },
        [
          _vm.embedSrc
            ? [
                _c(
                  "div",
                  {
                    ref: "element",
                    staticClass: "k-editor-video-block-embed",
                    attrs: { tabindex: "0" },
                    on: { dblclick: _vm.settings }
                  },
                  [_c("iframe", { attrs: { src: _vm.embedSrc } })]
                )
              ]
            : [
                _c(
                  "div",
                  { staticClass: "k-editor-video-block-placeholder" },
                  [
                    _c(
                      "k-button",
                      {
                        ref: "element",
                        attrs: { icon: "video" },
                        on: { click: _vm.settings }
                      },
                      [_vm._v("Add Video Url")]
                    )
                  ],
                  1
                )
              ]
        ],
        2
      ),
      _vm._v(" "),
      _c(
        "k-dialog",
        {
          ref: "settings",
          attrs: { size: "medium" },
          on: { submit: _vm.saveSettings }
        },
        [
          _c("k-form", {
            attrs: { fields: _vm.$options.fields },
            on: { submit: _vm.saveSettings },
            model: {
              value: _vm.attrs,
              callback: function($$v) {
                _vm.attrs = $$v
              },
              expression: "attrs"
            }
          })
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$80ee04', $80ee04);
          } else {
            api.reload('$80ee04', $80ee04);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./Image.vue":"components/Blocks/Image.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Blocks.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Blockquote = _interopRequireDefault(require("./Blocks/Blockquote.vue"));

var _Code = _interopRequireDefault(require("./Blocks/Code.vue"));

var _H = _interopRequireDefault(require("./Blocks/H1.vue"));

var _H2 = _interopRequireDefault(require("./Blocks/H2.vue"));

var _H3 = _interopRequireDefault(require("./Blocks/H3.vue"));

var _Hr = _interopRequireDefault(require("./Blocks/Hr.vue"));

var _Image = _interopRequireDefault(require("./Blocks/Image.vue"));

var _Paragraph = _interopRequireDefault(require("./Blocks/Paragraph.vue"));

var _Ul = _interopRequireDefault(require("./Blocks/Ul.vue"));

var _Ol = _interopRequireDefault(require("./Blocks/Ol.vue"));

var _Video = _interopRequireDefault(require("./Blocks/Video.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var components = {
  h1: _H.default,
  h2: _H2.default,
  h3: _H3.default,
  paragraph: _Paragraph.default,
  ul: _Ul.default,
  ol: _Ol.default,
  blockquote: _Blockquote.default,
  hr: _Hr.default,
  code: _Code.default,
  image: _Image.default,
  video: _Video.default
};
var blocks = {};
Object.keys(components).forEach(function (blockType) {
  var component = components[blockType];
  blocks[blockType] = {
    label: component.label,
    icon: component.icon,
    type: blockType,
    component: component,
    options: {
      append: component.append,
      breaks: component.breaks,
      code: component.code,
      marks: component.marks,
      placeholder: component.placeholder
    }
  };
});
var _default = blocks;
exports.default = _default;
},{"./Blocks/Blockquote.vue":"components/Blocks/Blockquote.vue","./Blocks/Code.vue":"components/Blocks/Code.vue","./Blocks/H1.vue":"components/Blocks/H1.vue","./Blocks/H2.vue":"components/Blocks/H2.vue","./Blocks/H3.vue":"components/Blocks/H3.vue","./Blocks/Hr.vue":"components/Blocks/Hr.vue","./Blocks/Image.vue":"components/Blocks/Image.vue","./Blocks/Paragraph.vue":"components/Blocks/Paragraph.vue","./Blocks/Ul.vue":"components/Blocks/Ul.vue","./Blocks/Ol.vue":"components/Blocks/Ol.vue","./Blocks/Video.vue":"components/Blocks/Video.vue"}],"components/Converters.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  h1: function h1(element) {
    return {
      type: "h1",
      content: element.innerHTML
    };
  },
  h2: function h2(element) {
    return {
      type: "h2",
      content: element.innerHTML
    };
  },
  h3: function h3(element) {
    return {
      type: "h3",
      content: element.innerHTML
    };
  },
  hr: function hr() {
    return {
      type: "hr"
    };
  },
  p: function p(element) {
    if (element.innerText.length === 0) {
      return false;
    }

    return {
      type: "paragraph",
      content: element.innerHTML
    };
  },
  br: function br() {
    return false;
  },
  img: function img(element) {
    return {
      type: "image",
      attrs: {
        alt: element.getAttribute("alt"),
        src: element.getAttribute("src")
      }
    };
  },
  pre: function pre(element) {
    return {
      type: "code",
      content: element.innerHTML
    };
  },
  li: function li(element) {
    var type = element.parentElement && element.parentElement.tagName === "OL" ? "ol" : "ul";
    return {
      type: type,
      content: element.innerHTML
    };
  },
  tr: function tr(element) {
    return {
      type: "paragraph",
      content: element.innerHTML
    };
  },
  figure: function figure(element) {
    var img = element.querySelector("img");
    var vid = element.querySelector("iframe");
    var caption = element.querySelector("figcaption");

    if (img) {
      return {
        type: "image",
        attrs: {
          alt: img.getAttribute("alt"),
          src: img.getAttribute("src"),
          caption: caption ? caption.innerText : null
        }
      };
    } else {
      return {
        type: "video",
        attrs: {
          src: vid.getAttribute("src"),
          caption: caption ? caption.innerText : null
        }
      };
    }
  }
};
exports.default = _default;
},{}],"components/Components.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Blocks = _interopRequireDefault(require("./Blocks.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var components = {};
/* Create component definitions dynamically */

Object.values(_Blocks.default).forEach(function (block) {
  components["k-editor-" + block.type + "-block"] = block.component;
});
var _default = components;
exports.default = _default;
},{"./Blocks.js":"components/Blocks.js"}],"components/Options.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var _default = {
  props: {
    blocks: Object
  }
};
exports.default = _default;
        var $b98856 = exports.default || module.exports;
      
      if (typeof $b98856 === 'function') {
        $b98856 = $b98856.options;
      }
    
        /* template */
        Object.assign($b98856, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "nav",
    { staticClass: "k-editor-block-options" },
    [
      _c(
        "button",
        {
          staticClass: "k-editor-block-option k-sort-handle",
          attrs: { type: "button" }
        },
        [_c("k-icon", { attrs: { type: "sort" } })],
        1
      ),
      _vm._v(" "),
      _c(
        "k-dropdown",
        [
          _c(
            "button",
            {
              staticClass: "k-editor-block-option k-editor-block-options-sort",
              attrs: { type: "button" },
              on: {
                mousedown: function($event) {
                  $event.stopPropagation()
                  return _vm.$refs.blockOptions.toggle()
                }
              }
            },
            [_c("k-icon", { attrs: { type: "angle-down" } })],
            1
          ),
          _vm._v(" "),
          _c(
            "k-dropdown-content",
            {
              ref: "blockOptions",
              staticClass: "k-editor-block-option-dropdown",
              nativeOn: {
                mousedown: function($event) {
                  $event.stopPropagation()
                }
              }
            },
            [
              _c("h4", [_vm._v("Turn into …")]),
              _vm._v(" "),
              _c(
                "ul",
                _vm._l(_vm.blocks, function(definition) {
                  return _c(
                    "li",
                    { key: definition.type },
                    [
                      _c(
                        "k-dropdown-item",
                        {
                          attrs: { icon: definition.icon },
                          on: {
                            click: function($event) {
                              return _vm.$emit("convert", definition.type)
                            }
                          }
                        },
                        [_vm._v(_vm._s(definition.label))]
                      )
                    ],
                    1
                  )
                }),
                0
              ),
              _vm._v(" "),
              _c("hr"),
              _vm._v(" "),
              _c(
                "k-dropdown-item",
                {
                  attrs: { icon: "add" },
                  on: {
                    click: function($event) {
                      return _vm.$emit("add", "paragraph")
                    }
                  }
                },
                [_vm._v("Insert block below")]
              ),
              _vm._v(" "),
              _c(
                "k-dropdown-item",
                {
                  attrs: { icon: "trash" },
                  on: {
                    click: function($event) {
                      return _vm.$emit("remove")
                    }
                  }
                },
                [_vm._v("Delete")]
              )
            ],
            1
          )
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$b98856', $b98856);
          } else {
            api.reload('$b98856', $b98856);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Editor.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Blocks = _interopRequireDefault(require("./Blocks.js"));

var _Converters = _interopRequireDefault(require("./Converters.js"));

var _Components = _interopRequireDefault(require("./Components.js"));

var _Options = _interopRequireDefault(require("./Options.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = {
  components: _objectSpread({}, _Components.default, {
    "k-editor-options": _Options.default
  }),
  blocks: _Blocks.default,
  props: {
    endpoints: Object,
    value: {
      type: [Array, Object],
      default: function _default() {
        return [];
      }
    }
  },
  data: function data() {
    var blocks = this.sanitize(this.value);
    return {
      selected: null,
      menu: {},
      blocks: blocks,
      modified: new Date()
    };
  },
  computed: {
    selectedBlockDefinition: function selectedBlockDefinition() {
      return this.getSelectedBlockDefinition();
    }
  },
  watch: {
    blocks: {
      handler: function handler(blocks) {
        this.$emit("input", blocks);
      },
      deep: true
    },
    value: function value(_value) {
      if (JSON.stringify(_value) !== JSON.stringify(this.blocks)) {
        this.blocks = this.sanitize(_value);
        this.modified = new Date();
      }
    }
  },
  methods: {
    add: function add(type) {
      this.appendAndFocus({
        type: type
      }, this.selected);
    },
    createBlock: function createBlock(data) {
      var defaults = {
        attrs: {},
        content: "",
        id: this.uuid(),
        type: "paragraph"
      };

      var block = _objectSpread({}, defaults, data);

      return block;
    },
    append: function append(block, after) {
      block = this.createBlock(block);
      var nextIndex = 0;

      if (after === null || after === undefined) {
        this.blocks.push(block);
        nextIndex = this.blocks.length - 1;
      } else {
        nextIndex = after + 1;
        this.blocks.splice(nextIndex, 0, block);
      }

      return nextIndex;
    },
    htmlElementToBlocks: function htmlElementToBlocks(element) {
      var _this = this;

      var blocks = [];
      var children = Array.from(element.children);
      children = children.filter(function (child) {
        if (['META', 'STYLE'].includes(child.tagName)) {
          return false;
        }

        return true;
      });

      if (children.length === 0) {
        if (element.innerHTML.length !== 0) {
          blocks.push({
            type: "paragraph",
            content: element.innerHTML
          });
        }
      } else {
        children.forEach(function (child) {
          var tag = child.tagName.toLowerCase();

          if (_Converters.default[tag]) {
            var block = _Converters.default[tag](child);

            if (block) {
              blocks.push(block);
            }
          } else {
            var _blocks;

            (_blocks = blocks).push.apply(_blocks, _toConsumableArray(_this.htmlElementToBlocks(child)));
          }
        });
      } // add all required attributes


      blocks = this.sanitize(blocks); // filter empty paragraphs

      blocks = blocks.filter(function (block) {
        if (block.type === "paragraph" && block.content.length === 0) {
          return false;
        }

        return true;
      });
      return blocks;
    },
    htmlToBlocks: function htmlToBlocks(html) {
      var element = window.document.createElement("div");
      element.innerHTML = html;
      return this.htmlElementToBlocks(element);
    },
    prepend: function prepend(block, before) {
      block = this.createBlock(block);
      this.blocks.splice(before, 0, block);
      return before;
    },
    prependAndFocus: function prependAndFocus(block, before) {
      var _this2 = this;

      var prev = this.prepend(block, before);
      this.$nextTick(function () {
        _this2.focus(before);
      });
    },
    optionIsActive: function optionIsActive(type) {
      return (this.activeOptions || []).includes(type);
    },
    sanitize: function sanitize(blocks) {
      var _this3 = this;

      if (blocks.length === 0) {
        blocks = [{
          type: "paragraph"
        }];
      } // assign a unique ID to each block


      blocks.map(function (block) {
        block.id = block.id || _this3.uuid();
        block.attrs = block.attrs || {};
        block.content = block.content || "";
        return block;
      });
      return blocks;
    },
    appendAndFocus: function appendAndFocus(block, after) {
      var _this4 = this;

      var next = this.append(block, after);
      this.$nextTick(function () {
        _this4.focus(next);
      });
    },
    blockTypeExists: function blockTypeExists(type) {
      if (!this.$options.blocks[type]) {
        return false;
      }

      if (!this.$options.components["k-editor-" + type + "-block"]) {
        return false;
      }

      return true;
    },
    convertTo: function convertTo(type) {
      var _this5 = this;

      var block = this.getSelectedBlock();
      var blockComponent = this.getSelectedBlockComponent();

      if (!block) {
        return false;
      }

      if (block.type === type) {
        return true;
      }

      var cursor = 0;

      if (blockComponent.cursorPosition) {
        cursor = blockComponent.cursorPosition();
      }

      block.type = type;
      block.id = this.uuid();
      this.$nextTick(function () {
        _this5.focus(_this5.selected, cursor);
      });
    },
    getBlock: function getBlock(index) {
      return this.blocks[index];
    },
    getBlockDefinition: function getBlockDefinition(index) {
      var block = this.getBlock(index);

      if (block && this.$options.blocks[block.type]) {
        return this.$options.blocks[block.type];
      }
    },
    getNextBlock: function getNextBlock(index) {
      return this.blocks[index + 1];
    },
    getPreviousBlock: function getPreviousBlock(index) {
      return this.blocks[index - 1];
    },
    getSelectedBlock: function getSelectedBlock() {
      if (this.selected !== null && this.selected !== undefined) {
        return this.blocks[this.selected];
      }
    },
    getSelectedBlockDefinition: function getSelectedBlockDefinition() {
      if (this.selected !== null && this.selected !== undefined) {
        return this.getBlockDefinition(this.selected);
      }
    },
    getBlockComponent: function getBlockComponent(index) {
      if (index === undefined || index === null) {
        return false;
      }

      var block = this.$refs['block-' + index];

      if (block && block[0]) {
        return block[0];
      }

      return false;
    },
    getFirstBlockComponent: function getFirstBlockComponent() {
      return this.getBlockComponent(0);
    },
    getLastBlockComponent: function getLastBlockComponent() {
      return this.getBlockComponent(this.blocks.length - 1);
    },
    getNextBlockComponent: function getNextBlockComponent() {
      return this.getBlockComponent(this.selected + 1);
    },
    getPreviousBlockComponent: function getPreviousBlockComponent() {
      return this.getBlockComponent(this.selected - 1);
    },
    getSelectedBlockComponent: function getSelectedBlockComponent() {
      return this.getBlockComponent(this.selected);
    },
    hasPreviousBlock: function hasPreviousBlock(index) {
      return this.blocks[index - 1] !== undefined;
    },
    hasNextBlock: function hasNextBlock(index) {
      return this.blocks[index + 1] !== undefined;
    },
    focus: function focus(index, cursor) {
      var block = null;

      if (index === null || index === undefined) {
        block = this.getSelectedBlockComponent() || this.getFirstBlockComponent();
      } else {
        block = this.getBlockComponent(index) || this.getFirstBlockComponent();
      }

      if (block) {
        block.focus(cursor);
      }
    },
    onAppend: function onAppend(index, block) {
      this.appendAndFocus(block, index);
    },
    getBlockTextLength: function getBlockTextLength(index) {
      var block = this.getBlock(index);

      if (block) {
        var div = document.createElement("div");
        div.innerHTML = block.content;
        return div.innerText.length;
      }

      return 0;
    },
    onBack: function onBack(index, data) {
      if (data.html.length === 0) {
        this.onRemove(index);
      } else {
        this.mergeWithPreviousBlock(index);
      }
    },
    onBlur: function onBlur(index) {
      this.selected = index;
    },
    onConvert: function onConvert(index, type) {
      var _this6 = this;

      var cursor = this.getBlockComponent(index).cursorPosition();
      this.blocks[index].type = type;
      this.blocks[index].id = this.uuid();
      this.$nextTick(function () {
        _this6.focus(index, cursor);
      });
    },
    onFocus: function onFocus(index) {
      this.selected = index;
      var block = this.getSelectedBlockComponent();

      if (block && block.menu) {
        this.menu = block.menu();
      } else {
        this.menu = {};
      }
    },
    onInput: function onInput(index, data) {
      if (data.content !== undefined) {
        this.blocks[index].content = data.content;
      }

      if (data.attrs !== undefined) {
        this.blocks[index].attrs = data.attrs || {};
      }
    },
    onMenu: function onMenu(menu) {
      this.menu = menu;
    },
    onNext: function onNext() {
      if (this.hasNextBlock(this.selected)) {
        var pos = "start";
        var selected = this.getSelectedBlockComponent();
        var next = this.getNextBlockComponent();

        if (selected.coordsAtCursor && next.coordsAtPos && next.posAtCoords) {
          var selectedCoords = selected.coordsAtCursor();
          var nextCoords = next.coordsAtPos(0); // calculate the nearest position of the next cursor

          var nextPos = next.posAtCoords({
            top: nextCoords.top,
            left: selectedCoords.left
          });

          if (nextPos && nextPos.pos) {
            pos = nextPos.pos;
          }
        }

        this.focus(this.selected + 1, pos);
      }
    },
    onPaste: function onPaste(index, html) {
      var blocks = this.htmlToBlocks(html);

      if (blocks.length === 0) {
        return false;
      }

      if (blocks.length === 1) {
        var selected = this.getSelectedBlockComponent();
        selected.insertHtml(html);
      } else {
        var _this$blocks;

        // append all pasted blocks
        (_this$blocks = this.blocks).splice.apply(_this$blocks, [index + 1, 0].concat(_toConsumableArray(blocks)));
      }
    },
    onPrev: function onPrev() {
      if (this.hasPreviousBlock(this.selected)) {
        var pos = "end";
        var selected = this.getSelectedBlockComponent();
        var prev = this.getPreviousBlockComponent();

        if (selected.coordsAtCursor && prev.coordsAtPos && prev.posAtCoords) {
          var selectedCoords = selected.coordsAtCursor();
          var prevCoords = prev.coordsAtEnd(); // calculate the nearest position of the prev cursor

          var prevPos = prev.posAtCoords({
            top: prevCoords.top,
            left: selectedCoords.left
          });

          if (prevPos && prevPos.pos) {
            pos = prevPos.pos;
          }
        }

        this.focus(this.selected - 1, pos);
      }
    },
    onPrepend: function onPrepend(index, block) {
      this.prepend(block, index);
      this.selected = index + 1;
    },
    onSelectAll: function onSelectAll() {
      var _this7 = this;

      this.blocks.forEach(function (block, index) {
        var component = _this7.getBlockComponent(index);

        if (component.select) {
          component.select();
        }
      });
    },
    onSplit: function onSplit(index, data) {
      this.split(index, data);
    },
    onRemove: function onRemove(index) {
      this.remove(index);
    },
    onUpdate: function onUpdate(index, data) {
      var _this8 = this;

      var block = this.blocks[index];
      var cursor = this.getSelectedBlockComponent().cursorPosition();
      this.$set(this.blocks, index, _objectSpread({}, block, data, {
        id: this.uuid()
      }));
      this.$nextTick(function () {
        _this8.focus(index, cursor);
      });
    },
    mergeWithPreviousBlock: function mergeWithPreviousBlock(index) {
      var _this9 = this;

      var block = this.getBlock(index);
      var previousBlock = this.getPreviousBlock(index);

      if (!block || !previousBlock) {
        return false;
      }

      var previousBlockComponent = this.getPreviousBlockComponent(index);
      var cursorAtEnd = this.getBlockTextLength(index - 1);
      previousBlock.content += block.content;
      previousBlock.id = this.uuid();
      this.removeBlock(index);
      this.$nextTick(function () {
        _this9.focus(index - 1, cursorAtEnd);
      });
    },
    split: function split(index, data) {
      var _this10 = this;

      var selectedBlock = this.getSelectedBlock();
      this.append({
        type: data.type || selectedBlock.type,
        content: data.after
      }, index);
      selectedBlock.content = data.before;
      selectedBlock.id = this.uuid();
      this.$nextTick(function () {
        _this10.focus(index + 1, "start");
      });
    },
    remove: function remove(index) {
      if (index === null || index === undefined) {
        index = this.selected;
      }

      this.removeBlock(index);

      if (this.blocks.length) {
        var previousBlock = this.getPreviousBlockComponent();

        if (previousBlock) {
          this.selected = index - 1;
          previousBlock.focus("end");
        } else {
          this.selected = null;
        }
      } else {
        this.appendAndFocus();
      }
    },
    removeBlock: function removeBlock(index) {
      this.blocks.splice(index, 1);
    },
    removeSelectedBlock: function removeSelectedBlock() {
      this.removeBlock(this.selected);
    },
    uuid: function uuid() {
      return '_' + Math.random().toString(36).substr(2, 9);
    }
  }
};
exports.default = _default;
        var $a4e35c = exports.default || module.exports;
      
      if (typeof $a4e35c === 'function') {
        $a4e35c = $a4e35c.options;
      }
    
        /* template */
        Object.assign($a4e35c, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { ref: "editor", staticClass: "k-editor" }, [
    _c(
      "div",
      { key: _vm.modified, staticClass: "k-editor-blocks" },
      [
        _c(
          "k-draggable",
          { attrs: { list: _vm.blocks, handle: true, options: { delay: 2 } } },
          _vm._l(_vm.blocks, function(block, index) {
            return _c(
              "div",
              {
                key: block.id,
                class: ["k-editor-block", "k-editor-" + block.type + "-block"],
                attrs: { "data-indent": block.attrs.indent },
                on: {
                  focusin: function($event) {
                    return _vm.onFocus(index)
                  },
                  focusout: function($event) {
                    return _vm.onBlur(index)
                  }
                }
              },
              [
                _vm.selected === index
                  ? _c("k-editor-options", {
                      attrs: { blocks: _vm.$options.blocks },
                      on: {
                        add: function($event) {
                          return _vm.add($event)
                        },
                        convert: function($event) {
                          return _vm.convertTo($event)
                        },
                        remove: _vm.remove
                      }
                    })
                  : _vm._e(),
                _vm._v(" "),
                _vm.blockTypeExists(block.type)
                  ? _c(
                      "k-editor-" + block.type + "-block",
                      _vm._b(
                        {
                          ref: "block-" + index,
                          refInFor: true,
                          tag: "component",
                          attrs: {
                            attrs: block.attrs,
                            content: block.content,
                            endpoints: _vm.endpoints
                          },
                          on: {
                            append: function($event) {
                              return _vm.onAppend(index, $event)
                            },
                            back: function($event) {
                              return _vm.onBack(index, $event)
                            },
                            convert: function($event) {
                              return _vm.onConvert(index, $event)
                            },
                            input: function($event) {
                              return _vm.onInput(index, $event)
                            },
                            menu: _vm.onMenu,
                            next: _vm.onNext,
                            paste: function($event) {
                              return _vm.onPaste(index, $event)
                            },
                            prepend: function($event) {
                              return _vm.onPrepend(index, $event)
                            },
                            prev: _vm.onPrev,
                            remove: function($event) {
                              return _vm.onRemove(index, $event)
                            },
                            selectAll: function($event) {
                              return _vm.onSelectAll(index, $event)
                            },
                            split: function($event) {
                              return _vm.onSplit(index, $event)
                            },
                            update: function($event) {
                              return _vm.onUpdate(index, $event)
                            }
                          }
                        },
                        "component",
                        _vm.$options.blocks[block.type].options,
                        false
                      )
                    )
                  : _vm._e()
              ],
              1
            )
          }),
          0
        )
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$a4e35c', $a4e35c);
          } else {
            api.reload('$a4e35c', $a4e35c);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./Blocks.js":"components/Blocks.js","./Converters.js":"components/Converters.js","./Components.js":"components/Components.js","./Options.vue":"components/Options.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"components/Field.vue":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Editor = _interopRequireDefault(require("./Editor.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
//
//
//
//
//
var _default = {
  components: {
    "k-editor": _Editor.default
  },
  props: {
    endpoints: Object,
    label: String,
    value: {
      type: [Array, Object],
      default: function _default() {
        return [];
      }
    }
  },
  methods: {
    onInput: function onInput(blocks) {
      this.$emit("input", blocks);
    }
  }
};
exports.default = _default;
        var $d661d9 = exports.default || module.exports;
      
      if (typeof $d661d9 === 'function') {
        $d661d9 = $d661d9.options;
      }
    
        /* template */
        Object.assign($d661d9, (function () {
          var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "k-field",
    { attrs: { label: _vm.label } },
    [
      _c("k-editor", {
        attrs: { value: _vm.value, endpoints: _vm.endpoints },
        on: { input: _vm.onInput }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true

          return {
            render: render,
            staticRenderFns: staticRenderFns,
            _compiled: true,
            _scopeId: null,
            functional: undefined
          };
        })());
      
    /* hot reload */
    (function () {
      if (module.hot) {
        var api = require('vue-hot-reload-api');
        api.install(require('vue'));
        if (api.compatible) {
          module.hot.accept();
          if (!module.hot.data) {
            api.createRecord('$d661d9', $d661d9);
          } else {
            api.reload('$d661d9', $d661d9);
          }
        }

        
        var reloadCSS = require('_css_loader');
        module.hot.dispose(reloadCSS);
        module.hot.accept(reloadCSS);
      
      }
    })();
},{"./Editor.vue":"components/Editor.vue","_css_loader":"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/css-loader.js","vue-hot-reload-api":"../node_modules/vue-hot-reload-api/dist/index.js","vue":"../node_modules/vue/dist/vue.runtime.esm.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _Field = _interopRequireDefault(require("./components/Field.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

panel.plugin("getkirby/editor", {
  fields: {
    editor: _Field.default
  }
});
},{"./components/Field.vue":"components/Field.vue"}],"../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57268" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)