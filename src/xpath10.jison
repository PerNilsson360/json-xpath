%lex
id    [^0-9'"\=!<>\-+*/|()\[\].,: \n\t$][^'"=!<>+*/:()\[\],  \n\t"]*
digit [0-9]+
blank [ \t\n]
%%
{blank}+             /* skip whitespace */
"="                            return '=' 
"!="                           return '!='        
"<"                            return '<' 
"<="                           return '<='
">"                            return '>' 
">="                           return '>=' 
"-"                            return '-' 
"+"                            return '+'
"*"                            return '*' 
"/"                            return '/' 
"//"                           return '//' 
"|"                            return '|' 
"("                            return '(' 
")"                            return ')' 
"["                            return '[' 
"]"                            return ']' 
"."                            return '.' 
".."                           return '..' 
","                            return ',' 
"::"                           return '::' 
"$"                            return '$' 
"and"                          return 'and'
"or"                           return 'or' 
"div"                          return 'div'
"mod"                          return 'mod'
"ancestor"	                   return 'ancestor'        
"ancestor-or-self"             return 'ancestor-or-self'
"child"	                       return 'child'  
"descendant"	               return 'descendant'	    
"descendant-or-self"           return 'descendant-or-self'
"following"	                   return 'following'	        
"following-sibling"            return 'following-sibling' 
"parent"	                   return 'parent'	        
"preceding"	                   return 'preceding'	        
"preceding-sibling"            return 'preceding-sibling' 
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
| NodeTest Predicates                            {}
| AxisSpecifier NodeTest                         {}
| AxisSpecifier NodeTest Predicates              {}
| AbbreviatedStep                                {}
;

AxisSpecifier
:  AxisName "::"                                 {}
;

AxisName
: "ancestor"	                                 {}
| "ancestor-or-self"	                         {}
| "child"	                                     {}
| "descendant"	                                 {}
| "descendant-or-self"	                         {}
| "following-sibling"	                         {}
| "parent"	                                     {}
| "self"                                         {}
;

NodeTest
: NameTest	                                     {}
| NodeTest Predicates                            {}
| AxisSpecifier NodeTest                         {}
;

Predicates
: Predicate                                      {}
| Predicate Predicates                           {}
;

Predicate
: "[" PredicateExpr "]"	                         {}
;

PredicateExpr
: Expr                                           {}
;

AbbreviatedAbsoluteLocationPath
: "//" RelativeLocationPath	                     {}
;

AbbreviatedRelativeLocationPath
: RelativeLocationPath "//" Step	             {}
;

AbbreviatedStep
: "."                                            {}
| ".."                                           {}
;

Expr
: OrExpr                                         { $$ = $1; }
;

PrimaryExpr
: VariableReference                              {}
| "(" Expr ")"	                                 { $$ = $2; }
| LITERAL	                                     { $$ = new StringLiteral(yytext); }
| NUMBER	                                     { $$ = new NumericLiteral(Number(yytext)); }
| FunctionCall                                   { $$ = $1; }
;

FunctionCall
: FunctionName "(" ")"                           { $$ = createFunction($1, []); }
| FunctionName "(" Arguments ")"                 { $$ = createFunction($1, $3); }
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
| FilterExpr Predicate                           {}
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
| EqualityExpr "=" RelationalExpr	             {}
| EqualityExpr "!=" RelationalExpr               {}
;

RelationalExpr
: AdditiveExpr	                                 { $$ = $1; }
| RelationalExpr "<" AdditiveExpr	             {}
| RelationalExpr ">" AdditiveExpr	             {}
| RelationalExpr "<=" AdditiveExpr	             {}
| RelationalExpr ">=" AdditiveExpr               {}
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

FunctionName
: IDENTIFIER                                     { $$ = yytext; }
;

VariableReference
: '$' IDENTIFIER                                 {}
;

NameTest
: '*'                                            {}
| IDENTIFIER                                     {}
;

%%
const Path = require('./Expr.js').Path;
const Root = require('./Expr.js').Root;
const BinaryExpr = require('./Expr.js').BinaryExpr;
const createStep = require('./Expr.js').createStep;
const createFunction = require('./Expr.js').createFunction;
const StringLiteral = require('./Expr.js').StringLiteral;
const NumericLiteral = require('./Expr.js').NumericLiteral;
