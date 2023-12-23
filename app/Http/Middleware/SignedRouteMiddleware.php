<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SignedRouteMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        abort_if($request->has('expires') && Carbon::now()->timestamp > $request->get('expires'), Response::HTTP_FORBIDDEN);

        $query = $request->all();
        $params = $request->route()->parameters;
        unset($query['token']);
        $checksum =str_replace(config('app.url'), '',  route($request->route()->getName(), array_merge($params, $query)));
        abort_if(sha1($checksum) != $request->get('token'), Response::HTTP_FORBIDDEN);

        return $next($request);
    }
}
