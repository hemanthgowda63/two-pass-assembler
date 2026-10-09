import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class SicHttpServer {

    public static void main(String[] args) throws IOException {
        int port = 8080;
        if (args.length > 0) {
            try { port = Integer.parseInt(args[0]); } catch (Exception ignored) {}
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/assemble-and-run", new AssembleHandler());
        server.createContext("/api/health", new HealthHandler());
        server.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());

        System.out.println("==================================================");
        System.out.println("SIC Simulator Backend REST API Server running on port " + port);
        System.out.println("API Endpoint: http://localhost:" + port + "/api/assemble-and-run");
        System.out.println("==================================================");

        server.start();
    }

    static class AssembleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                sendResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            String code = extractCodeFromJsonOrRaw(body);

            if (code == null || code.trim().isEmpty()) {
                sendResponse(exchange, 400, "{\"success\":false,\"errorMessage\":\"Source code is empty\"}");
                return;
            }

            SicEngine.RunResult result = SicEngine.assembleAndRun(code);
            String jsonResponse = SicEngine.toJson(result);

            int status = result.success ? 200 : 400;
            sendResponse(exchange, status, jsonResponse);
        }
    }

    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            sendResponse(exchange, 200, "{\"status\":\"OK\",\"service\":\"SIC Assembler Simulator API\"}");
        }
    }

    private static String extractCodeFromJsonOrRaw(String body) {
        if (body.trim().startsWith("{")) {
            int idx = body.indexOf("\"code\"");
            if (idx != -1) {
                int colonIdx = body.indexOf(":", idx);
                if (colonIdx != -1) {
                    int startQuote = body.indexOf("\"", colonIdx + 1);
                    if (startQuote != -1) {
                        StringBuilder sb = new StringBuilder();
                        boolean escaped = false;
                        for (int i = startQuote + 1; i < body.length(); i++) {
                            char c = body.charAt(i);
                            if (escaped) {
                                if (c == 'n') sb.append('\n');
                                else if (c == 'r') sb.append('\r');
                                else if (c == 't') sb.append('\t');
                                else sb.append(c);
                                escaped = false;
                            } else if (c == '\\') {
                                escaped = true;
                            } else if (c == '"') {
                                break;
                            } else {
                                sb.append(c);
                            }
                        }
                        return sb.toString();
                    }
                }
            }
        }
        return body;
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String responseText) throws IOException {
        byte[] bytes = responseText.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}
