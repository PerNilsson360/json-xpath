// MIT license
//
// Copyright 2024 Per Nilsson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the “Software”), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

%lex
id    [^0-9'"\=!<>\-+*/|()\[\].,: \n\t$][^'"=!<>+*/:()\[\],  \n\t"]*
digit [0-9]+
blank [ \t\n]
%%
{blank}+             /* skip whitespace */
"="                            return '=' 
"!="                           return '!='
"<="                           return '<='        
"<"                            return '<' 
">="                           return '>='
">"                            return '>'    
"-"                            return '-' 
"+"                            return '+'
"*"                            return '*'
"//"                           return '//'
"/"                            return '/'
"|"                            return '|'
"("                            return '('
")"                            return ')'
"["                            return '['
"]"                            return ']'
".."                           return '..'
"."                            return '.' 
","                            return ',' 
"::"                           return '::' 
"$"                            return '$' 
"and"                          return 'and'
"or"                           return 'or' 
"div"                          return 'div'
"mod"                          return 'mod'
"ancestor-or-self"             return 'ancestor-or-self'
"ancestor"	                   return 'ancestor'
"child"	                       return 'child'
"descendant-or-self"           return 'descendant-or-self'
"descendant"	               return 'descendant'
"following-sibling"            return 'following-sibling' 	    
"following"	                   return 'following'	        
"parent"	                   return 'parent'
"preceding-sibling"            return 'preceding-sibling' 
"preceding"	                   return 'preceding'	        
"self"                         return 'self'
([0-9]+("."[0-9]+)?)|"."[0-9]+ return 'NUMBER'
{id}                           return 'IDENTIFIER'
\"[^"]*\"                      return 'LITERAL'
\'[^']*\'                      return 'LITERAL'
<<EOF>>                        return 'EOF'
.                              return 'INVALID'
/lex

%start Xpath

%% /* language grammar */

Xpath
: Expr EOF                                       { return $1;}
;

LocationPath
: RelativeLocationPath                           { $$ = $1; }
| AbsoluteLocationPath                           { $$ = $1; }
;

AbsoluteLocationPath
: "/"                                            { $$ = new Path(new Root()); }
| "/" RelativeLocationPath                       { $$ = $2; $$.addFront(new Root());}
| AbbreviatedAbsoluteLocationPath                { $$ = $1; }
;

RelativeLocationPath
: Step	                                         { $$ =  new Path($1); } 
| RelativeLocationPath "/" Step	                 { $$ = $1; $$.addBack($3); }
| AbbreviatedRelativeLocationPath                { $$ = $1}
;

Step
: NodeTest                                       { $$ = createStep("", $1); }
| NodeTest Predicates                            { $$ = createStep("", $1); $$.addPredicates($2); }
| AxisSpecifier NodeTest                         { $$ = createStep($1, $2); }
| AxisSpecifier NodeTest Predicates              { $$ = createStep($1, $2); $$.addPredicates($3);}
| AbbreviatedStep                                { $$ = createStep("", $1); }
;

AxisSpecifier
:  AxisName "::"                                 { $$ = $1; }
;

AxisName
: "ancestor"	                                 { $$ = yytext; }
| "ancestor-or-self"	                         { $$ = yytext; }
| "child"	                                     { $$ = yytext; }
| "descendant"	                                 { $$ = yytext; }
| "descendant-or-self"	                         { $$ = yytext; }
| "following-sibling"	                         { $$ = yytext; }
| "parent"	                                     { $$ = yytext; }
| "self"                                         { $$ = yytext; }
;

NodeTest
: NameTest	                                     { $$ = $1; }
;

Predicates
: Predicate                                      { $$ = [$1];}
| Predicate Predicates                           { $$ = $2;  $$.unshift($1); }
;

Predicate
: "[" PredicateExpr "]"	                         { $$ = new Predicate($2); }
;

PredicateExpr
: Expr                                           { $$ = $1; }
;

AbbreviatedAbsoluteLocationPath
: "//" RelativeLocationPath	                     { $$ = $2; $$.addAbsoluteDescendant(); }
;

AbbreviatedRelativeLocationPath
: RelativeLocationPath "//" Step	             { $$ = $1; $$.addRelativeDescendant($3); }
;

AbbreviatedStep
: "."                                            { $$ = '.'; }
| ".."                                           { $$ = '..'; }
;

Expr
: OrExpr                                         { $$ = $1; }
;

PrimaryExpr
: VariableReference                              {}
| "(" Expr ")"	                                 { $$ = $2; }
| LITERAL	                                     { $$ = new StringLiteral(yytext.substring(1,yytext.length - 1)); }
| NUMBER	                                     { $$ = new NumericLiteral(Number(yytext)); }
| FunctionCall                                   { $$ = $1; }
;

FunctionCall
: IDENTIFIER "(" ")"                           { $$ = createFunction($1, []); }
| IDENTIFIER "(" Arguments ")"                 { $$ = createFunction($1, $3); }
;

Arguments
: Expr                                           { $$ = [$1]; }
| Expr "," Arguments                             { $$ = $3; $$.unshift($1); }
;

UnionExpr
: PathExpr	                                     { $$ = $1; }
| UnionExpr "|" PathExpr	                     { $$ = new BinaryExpr($1, $3, (a, b) => a.nodeSetUnion(b), (a) => a);}
;

PathExpr
: LocationPath	                                 { $$ = $1; }
| FilterExpr	                                 { $$ = $1; }
;

FilterExpr
: PrimaryExpr	                                 { $$ = $1; }
| FilterExpr Predicate                           { $$ = $1; $$.addPredicates([$2]); }
;

OrExpr
: AndExpr                                        { $$ = $1; }
| OrExpr "or" AndExpr	                         { $$ = new BinaryExpr($1, $3, (a, b) => a || b, (a) => a.getBoolean()); }
;

AndExpr
: EqualityExpr	                                 { $$ = $1; }
| AndExpr "and" EqualityExpr	                 { $$ = new BinaryExpr($1, $3, (a, b) => a && b, (a) => a.getBoolean()); }
;

EqualityExpr
: RelationalExpr	                             { $$ = $1; }
| EqualityExpr "=" RelationalExpr	             { $$ = new BinaryExpr($1, $3, (a, b) => a.compareEquality(b, (a, b) => a === b), (a) => a); }
| EqualityExpr "!=" RelationalExpr               { $$ = new BinaryExpr($1, $3, (a, b) => a.compareEquality(b, (a, b) => a !== b), (a) => a); }
;

RelationalExpr
: AdditiveExpr	                                 { $$ = $1; }
| RelationalExpr "<" AdditiveExpr	             { $$ = new BinaryExpr($1, $3, (a, b) => a.compareOrdering(b, (a, b) => a < b), (a) => a); }
| RelationalExpr ">" AdditiveExpr	             { $$ = new BinaryExpr($1, $3, (a, b) => a.compareOrdering(b, (a, b) => a > b), (a) => a); }
| RelationalExpr "<=" AdditiveExpr	             { $$ = new BinaryExpr($1, $3, (a, b) => a.compareOrdering(b, (a, b) => a <= b), (a) => a); }
| RelationalExpr ">=" AdditiveExpr               { $$ = new BinaryExpr($1, $3, (a, b) => a.compareOrdering(b, (a, b) => a >= b), (a) => a); }
;

AdditiveExpr
: MultiplicativeExpr	                         { $$ = $1; }
| AdditiveExpr "+" MultiplicativeExpr	         { $$ = new BinaryExpr($1, $3, (a, b) => a + b, (a) => a.getNumber()); }
| AdditiveExpr "-" MultiplicativeExpr	         { $$ = new BinaryExpr($1, $3, (a, b) => a - b, (a) => a.getNumber()); }
;

MultiplicativeExpr
: UnaryExpr	                                     { $$ = $1; }
| MultiplicativeExpr "*" UnaryExpr	             { $$ = new BinaryExpr($1, $3, (a, b) => a * b, (a) => a.getNumber()); }
| MultiplicativeExpr "div" UnaryExpr	         { $$ = new BinaryExpr($1, $3, (a, b) => a / b, (a) => a.getNumber()); }
| MultiplicativeExpr "mod" UnaryExpr	         { $$ = new BinaryExpr($1, $3, (a, b) => a % b, (a) => a.getNumber()); }
;

UnaryExpr
: UnionExpr	                                     { $$ = $1; }
| "-" UnaryExpr                                  { $$ = new BinaryExpr(new NumericLiteral(0), $2, (a, b) => a - b, (a) => a.getNumber());}
;

VariableReference
: '$' IDENTIFIER                                 { $$ = $2.yytext }
;

NameTest
: '*'                                            { $$ = '*'; }
| IDENTIFIER                                     { $$ = yytext; }
;

%%
const Path = require('./Expr.js').Path;
const Root = require('./Expr.js').Root;
const BinaryExpr = require('./Expr.js').BinaryExpr;
const Predicate = require('./Expr.js').Predicate;
const createStep = require('./Expr.js').createStep;
const createFunction = require('./Expr.js').createFunction;
const StringLiteral = require('./Expr.js').StringLiteral;
const NumericLiteral = require('./Expr.js').NumericLiteral;
