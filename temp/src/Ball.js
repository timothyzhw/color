var square = function () {

    this.x = 0;
    this.y = 0;

    //F = G + H
    this.G = 0;
    this.F = 0;
    this.H = 0;

    this.visited = false;
    this.closed = false;
    this.parent = null;

    this.color = 0;
    this.ball = 0;
};
square.prototype = {
    heuristic: function (goal) {
        var value = Math.abs(goal.x - this.x) + Math.abs(goal.y - this.y);
        return value;
    }
}

var board = function (size) {

    var _squares = [];
    this.squares = _squares;
    this.size = size;
    this.emptySquares = [];
    for (var i = 0; i < size; i++) {
        var _line = [];
        for (var j = 0; j < size; j++) {
            var _square = new square();
            _square.y = i;
            _square.x = j;
            _line[j] = _square;
            this.emptySquares.push(_square);
        }
        _squares[i] = _line;
    }
};
board.prototype = {
    getSquare: function (x, y) {
        return this.squares[y][x];
    },
    getNeighbors: function (x, y) {
        var ret = [];
        if (x > 0) {
            var left = this.getSquare(x - 1, y);
            //left.
            ret.push(left);
        }
        if (y > 0) {
            var up = this.getSquare(x, y - 1);
            ret.push(up);
        }
        if (x < this.size - 1) {
            var right = this.getSquare(x + 1, y);
            ret.push(right);
        }
        if (y < this.size - 1) {
            var down = this.getSquare(x, y + 1);
            ret.push(down);
        }

        return ret;
    },
    someBall: function (n) {
        var balls = [];
        if (this.emptySquares.length <= n) {
            balls = this.emptySquares;
            this.emptySquares = [];
            return balls;
        } else {
            for (var i = 0; i < n; i++) {
                var random = Math.random();
                var r = Math.round(random * this.emptySquares.length);
                if (r >= this.emptySquares.length) {
                    console.debug(r);
                    r = this.emptySquares.length - 1;
                }
                var sq = this.emptySquares[r];
                this.emptySquares.splice(r, 1);
                balls.push(sq);
            }
        }
        balls.forEach(function (v) {
            if (!v) alert('some error');
            var random = Math.random();

            v.ball = true;
            v.color = Math.ceil(random * 6);

        });
        return balls;
    },
    moveBall: function (start, end) {
        start.ball = false;
        end.ball = true;
        end.color = start.color;
        start.start = 1;
        end.end = 1;
        this.emptySquares.splice(this.emptySquares.indexOf(end), 1);
        this.emptySquares.push(start);
    },
    resetSquare: function () {
        _squares = this.squares;
        var size = this.size;
        for (var i = 0; i < size; i++) {
            var _line = _squares[i];
            for (var j = 0; j < size; j++) {
                var _square = _line[j];
                _square.G = 0;
                _square.H = 0;
                _square.F = 0;
                _square.visited = false;
                _square.closed = false;
                _square.parent = null;
            }
            _squares[i] = _line;
        }
    }

};

var astar = function (bo) {
    var _board = bo;
    this.openList = [];
    this.closedList = [];
    this.board = _board;
    this.boardPath = function (startx, starty, endx, endy) {
        var start = _board.getSquare(startx, starty);
        var end = _board.getSquare(endx, endy);
        return this.path(start, end);
    };
    this.path = function (start, end) {
        this.openList = [];
        this.closedList = [];
        var openList = this.openList;
        var closedList = this.closedList;
        _board.resetSquare();
        openList.push(start);
        while (openList.length > 0) {
            var lowid = 0;
            for (li = openList.length - 1, lowid = li; li >= 0; li--) {
                if (openList[li].F < openList[lowid].F)
                    lowid = li;
            }
            var currentNode = openList[lowid];
            console.debug("x:" + currentNode.x + " y:" + currentNode.y);
            if (currentNode.x == end.x && currentNode.y == end.y) {
                var curr = currentNode;
                var ret = [];
                while (curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();

            }
            // Normal case -- move currentNode from open to closed, process each of its neighbors
            //F = G + H
            openList.splice(lowid, 1);
            closedList.push(currentNode);
            var ret = this.searchInNeighbors(currentNode, end);

            if (ret)
                return ret;
            /*var neighbors = _board.getNeighbors(currentNode.x, currentNode.y);
            for(var i=0; i<neighbors.length;i++) {
                var neighbor = neighbors[i];
                if(closedList.indexOf(neighbor) >= 0 || neighbor.ball) {
                    // not a valid node to process, skip to next neighbor
                    continue;
                }
                // g score is the shortest distance from start to current node, we need to check if
                //	the path we have arrived at this neighbor is the shortest one we have seen yet
                var gScore = currentNode.G + 1;
                // 1 is the distance from a node to it's neighbor
                var gScoreIsBest = false;
                if(openList.indexOf(neighbor) == -1) {
                    // This the the first time we have arrived at this node, it must be the best
                    // Also, we need to take the h (heuristic) score since we haven't done so yet
                    gScoreIsBest = true; neighbor.H = neighbor.heuristic(end);
                    openList.push(neighbor);
                }
                else if(gScore < neighbor.g) {
                    // We have already seen the node, but last time it had a worse g (distance from start)
                    gScoreIsBest = true;
                }
                if(gScoreIsBest) {
                    // Found an optimal (so far) path to this node.	Store info on how we got here and
                    //	just how good it really is...
                    neighbor.parent = currentNode;
                    neighbor.G = gScore;
                    neighbor.F = neighbor.G + neighbor.H;
                    neighbor.debug = "F: " + neighbor.F + "<br />G: " + neighbor.G + "<br />H: " + neighbor.H;
                   // console.debug(neighbor.debug);
                }
            }*/
        }
    }

    this.searchInNeighbors = function (current, end) {
        var openList = this.openList;
        var closedList = this.closedList;
        var neighbors = _board.getNeighbors(current.x, current.y);
        var hasInOpenlist = [];
        for (var i = neighbors.length - 1; i >= 0; i--) {
            var neighbor = neighbors[i];
            if (closedList.indexOf(neighbor) >= 0 || neighbor.ball) {
                // not a valid node to process, skip to next neighbor
                neighbors.splice(i, 1);
                continue;
            }
            if (neighbor.x == end.x && neighbor.y == end.y) {
                var curr = current;
                var ret = [];
                while (curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();

            }
            // g score is the shortest distance from start to current node, we need to check if
            //	the path we have arrived at this neighbor is the shortest one we have seen yet
            var gScore = current.G + 1;
            // 1 is the distance from a node to it's neighbor
            var gScoreIsBest = false;
            if (openList.indexOf(neighbor) == -1) {
                // This the the first time we have arrived at this node, it must be the best
                // Also, we need to take the h (heuristic) score since we haven't done so yet
                gScoreIsBest = true;
                neighbor.H = neighbor.heuristic(end);
                openList.push(neighbor);
            } else {
                hasInOpenlist.push(neighbor);
                if (gScore < neighbor.g) {
                    // We have already seen the node, but last time it had a worse g (distance from start)
                    gScoreIsBest = true;
                }
            }
            if (gScoreIsBest) {
                // Found an optimal (so far) path to this node.	Store info on how we got here and
                //	just how good it really is...
                neighbor.parent = current;
                neighbor.G = gScore;
                neighbor.F = neighbor.G + neighbor.H;
                // neighbor.debug = "F: " + neighbor.F + "<br />G: " + neighbor.G + "<br />H: " + neighbor.H;
                // console.debug(neighbor.debug);
            }
        }
        var lowid = 0;
        var lowids = [];
        var lowSquares = [];
        for (var i = 0; i < neighbors.length; i++) {
            if (neighbors[i].F < neighbors[lowid].F)
                lowid = i;
        }
        if (lowid >= 0 && neighbors.length) {
            for (var i = 0; i < neighbors.length; i++) {
                if (neighbors[i].F === neighbors[lowid].F && hasInOpenlist.indexOf(neighbors[i]) < 0)
                    lowSquares.push(neighbors[i]);
            }
            if (lowSquares.length > 0) {
                var n = lowSquares[0];
                n.closed = true;
                closedList.push(n);
                return this.searchInNeighbors(n, end);
            } else
                return null;

        } else
            return null;
    }
    this.cleanLine= function cleanLine(square) {
                var topdown = [];
                var leftright = [];
                var lefttop = [];
                var righttop = [];

                var i = square.y;
                while (i - 1 >= 0) {
                    var t = _board.getSquare(square.x, i - 1);
                    if (t.ball && t.color == square.color) {
                        topdown.push(t);
                        i--;
                    } else {
                        break;
                    }
                }
                i = square.y;
                while (i + 1 < _board.size) {
                    var t = _board.getSquare(square.x, i + 1);
                    if (t.ball && t.color == square.color) {
                        topdown.push(t);
                        i++;
                    } else {
                        break;
                    }
                }

                //check left-right
                i = square.x;
                while (i - 1 >= 0) {
                    var t = _board.getSquare(i - 1, square.y);
                    if (t.ball && t.color == square.color) {
                        leftright.push(t);
                        i--;
                    } else {
                        break;
                    }
                }
                i = square.x;
                while (i + 1 < _board.size) {
                    var t = _board.getSquare(i + 1, square.y);
                    if (t.ball && t.color == square.color) {
                        leftright.push(t);
                        i++;
                    } else {
                        break;
                    }
                }

                //check left-top
                i = square.x;
                j = square.y;
                while (i - 1 >= 0 && j - 1 >= 0) {
                    var t = _board.getSquare(i - 1, j - 1);
                    if (t.ball && t.color == square.color) {
                        lefttop.push(t);
                        i--;
                        j--;
                    } else {
                        break;
                    }
                }
                i = square.x;
                j = square.y;
                while (i + 1 < _board.size && j + 1 < _board.size) {
                    var t = _board.getSquare(i + 1, j + 1);
                    if (t.ball && t.color == square.color) {
                        lefttop.push(t);
                        i++;
                        j++;
                    } else {
                        break;
                    }
                }

                //check right - top
                i = square.x;
                j = square.y;
                while (i + 1 < _board.size && j - 1 >= 0) {
                    var t = _board.getSquare(i + 1, j - 1);
                    if (t.ball && t.color == square.color) {
                        righttop.push(t);
                        i++;
                        j--;
                    } else {
                        break;
                    }
                }
                i = square.x;
                j = square.y;
                while (i - 1 >= 0 && j + 1 < _board.size) {
                    var t = _board.getSquare(i - 1, j + 1);
                    if (t.ball && t.color == square.color) {
                        righttop.push(t);
                        i--;
                        j++;
                    } else {
                        break;
                    }
                }

                var cleanball = false;
                if (topdown && topdown.length >= 4) {
                    cleanball = true;
                    for (var i = 0; i < topdown.length; i++) {
                        var t = topdown[i];
                        t.ball = false;
                        mapElement(t).removeClass("ball" + t.color);
                        _board.emptySquares.push(t);
                    }
                }
                if (leftright && leftright.length >= 4) {
                    cleanball = true;
                    for (var i = 0; i < leftright.length; i++) {
                        var t = leftright[i];
                        t.ball = false;
                        mapElement(t).removeClass("ball" + t.color);
                        _board.emptySquares.push(t);
                    }
                }
                if (lefttop && lefttop.length >= 4) {
                    cleanball = true;
                    for (var i = 0; i < lefttop.length; i++) {
                        var t = lefttop[i];
                        t.ball = false;
                        mapElement(t).removeClass("ball" + t.color);
                        _board.emptySquares.push(t);
                    }
                }
                if (righttop && righttop.length >= 4) {
                    cleanball = true;
                    for (var i = 0; i < righttop.length; i++) {
                        var t = righttop[i];
                        t.ball = false;
                        mapElement(t).removeClass("ball" + t.color);
                        _board.emptySquares.push(t);
                    }
                }

                if (cleanball) {
                    square.ball = false;
                    mapElement(square).removeClass("ball" + square.color);
                    _board.emptySquares.push(square);
                }
                return cleanball;
            }
}