'use strict';

if (!String.prototype.capitalize)
{
  /**
   * @returns {string} First letter capitalized
   */
  String.prototype.capitalize = function ()
  {
    return this.charAt(0).toUpperCase() + this.substring(1);
  }
}

if (!String.prototype.lpad)
{
  /**
   * Left pad
   * @param {string} [character="0"]
   * @param {int} [count=2]
   */
  String.prototype.lpad = function (character, count)
  {
    let ch = character || "0";
    let cnt = count || 2;

    let s = "";
    while (s.length < (cnt - this.length))
    {
      s += ch;
    }
    s = s.substring(0, cnt - this.length);
    return s + this;
  }
}

if (!String.prototype.rpad)
{
  /**
   * Right pad
   * @param {string} [character="0"]
   * @param {int} [count=2]
   */
  String.prototype.rpad = function (character, count)
  {
    let ch = character || "0";
    let cnt = count || 2;

    let s = "";
    while (s.length < (cnt - this.length))
    {
      s += ch;
    }
    s = s.substring(0, cnt - this.length);
    return this + s;
  }
}

if (!String.format)
{
  /**
   * Format a string in a flexible way. Scans for %s strings and replaces them with arguments. List of patterns is modifiable via String.format.map.
   * @param {string} template
   * @param {any} [argv]
   */
  String.format = function (template)
  {
    let map = String.format.map;
    let args = Array.prototype.slice.call(arguments, 1);

    let replacer = function (match, group1, group2, index)
    {
      if (template.charAt(index - 1) == "%")
      {
        return match.substring(1);
      }
      if (!args.length)
      {
        return match;
      }
      let obj = args[0];

      let group = group1 || group2;
      let parts = group.split(",");
      let name = parts.shift();
      let method = map[name.toLowerCase()];
      if (!method)
      {
        return match;
      }

      let obj = args.shift();
      let replaced = obj[method].apply(obj, parts);

      let first = name.charAt(0);
      if (first != first.toLowerCase())
      {
        replaced = replaced.capitalize();
      }

      return replaced;
    }
    return template.replace(/%(?:([a-z]+)|(?:{([^}]+)}))/gi, replacer);
  }
}

if (!String.format.map)
{
  String.format.map = {
    "s": "toString"
  }
}

if (!String.prototype.format)
{
  /**
   * Convenience shortcut to String.format(this)
   */
  String.prototype.format = function ()
  {
    let args = [].prototype.slice.call(arguments);
    args.unshift(this);
    return String.format.apply(String, args);
  }

}
