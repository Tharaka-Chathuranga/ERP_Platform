package com.enlear.erp.oilmart.service.pdf;

import com.enlear.erp.oilmart.config.OilMartProperties;
import com.enlear.erp.oilmart.model.OilMartBankDetails;
import com.enlear.erp.oilmart.model.OilMartInvoice;
import com.enlear.erp.oilmart.model.OilMartItem;
import com.enlear.erp.oilmart.model.OilMartQuotation;
import com.enlear.erp.oilmart.repository.OilMartClientRepository;
import com.enlear.erp.oilmart.repository.OilMartItemRepository;
import com.enlear.erp.shared.error.BusinessException;
import com.enlear.erp.user.exposed.UserApi;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

@Service
@Transactional(readOnly = true)
public class OilMartDocumentPdfService {

    private static final String TEMPLATE = "document";

    private final TemplateEngine templates;
    private final OilMartItemRepository items;
    private final OilMartClientRepository clients;
    private final UserApi users;
    private final OilMartProperties properties;

    public OilMartDocumentPdfService(TemplateEngine oilMartDocumentTemplateEngine,
                                     OilMartItemRepository items,
                                     OilMartClientRepository clients,
                                     UserApi users,
                                     OilMartProperties properties) {
        this.templates = oilMartDocumentTemplateEngine;
        this.items = items;
        this.clients = clients;
        this.users = users;
        this.properties = properties;
    }

    public byte[] renderQuotation(OilMartQuotation quotation) {
        Map<UUID, OilMartItem> itemsById = itemsById();
        List<OilMartDocumentPdfView.Line> lines = quotation.getLines().stream()
                .map(line -> line(itemsById.get(line.getItemId()), line.getQuantityLitres(),
                        line.getUnitPrice(), line.getDiscountPercent(), line.getLineTotal()))
                .toList();
        OilMartDocumentPdfView.Party billTo = client(quotation.getClientId());

        return render(new OilMartDocumentPdfView(
                "QUOTATION",
                quotation.getQuotationNo(),
                quotation.getIssuedDate(),
                quotation.getValidUntil(),
                null,
                properties.currencyCode(),
                accountCode(quotation.getClientId()),
                salesRep(quotation.getCreatedByUserId()),
                logoUri(),
                company(),
                billTo,
                billTo,
                lines,
                quotation.getSubtotal(),
                quotation.getGstRatePercent(),
                quotation.getGstAmount(),
                quotation.getGrandTotal(),
                null,
                quotation.getNote()));
    }

    public byte[] renderInvoice(OilMartInvoice invoice) {
        Map<UUID, OilMartItem> itemsById = itemsById();
        List<OilMartDocumentPdfView.Line> lines = invoice.getLines().stream()
                .map(line -> line(itemsById.get(line.getItemId()), line.getQuantityLitres(),
                        line.getUnitPrice(), line.getDiscountPercent(), line.getLineTotal()))
                .toList();
        OilMartDocumentPdfView.Party billTo = client(invoice.getClientId());

        return render(new OilMartDocumentPdfView(
                "INVOICE",
                invoice.getInvoiceNo(),
                invoice.getInvoiceDate(),
                null,
                invoice.getQuotationNo(),
                properties.currencyCode(),
                accountCode(invoice.getClientId()),
                salesRep(invoice.getCreatedByUserId()),
                logoUri(),
                company(),
                billTo,
                billTo,
                lines,
                invoice.getSubtotal(),
                invoice.getGstRatePercent(),
                invoice.getGstAmount(),
                invoice.getGrandTotal(),
                bank(invoice.getBankDetails()),
                invoice.getNote()));
    }

    private byte[] render(OilMartDocumentPdfView view) {
        Context context = new Context();
        context.setVariable("doc", view);
        String xhtml = templates.process(TEMPLATE, context);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(xhtml);
            renderer.layout();
            renderer.createPDF(out);
            return out.toByteArray();
        } catch (Exception failure) {
            throw new PdfRenderingFailed(view.documentNo(), failure);
        }
    }

    private OilMartDocumentPdfView.Line line(OilMartItem item, BigDecimal quantity,
                                             BigDecimal unitPrice, BigDecimal discountPercent,
                                             BigDecimal lineTotal) {
        List<String> descriptionLines = new ArrayList<>();
        if (item != null) {
            String branding = joinNonBlank(" ", item.getBrand(), item.getGrade());
            if (!branding.isEmpty()) {
                descriptionLines.add(branding);
            }
            if (item.getOilType() != null) {
                descriptionLines.add(item.getOilType().name().replace('_', ' '));
            }
        }
        return new OilMartDocumentPdfView.Line(
                item != null ? item.getCode() : "",
                item != null ? item.getName() : "",
                descriptionLines,
                plain(quantity),
                plain(quantity),
                item != null ? item.getUnitOfMeasure() : OilMartItem.DEFAULT_UNIT_OF_MEASURE,
                unitPrice,
                discountPercent,
                lineTotal);
    }

    private String plain(BigDecimal value) {
        return value == null ? "" : value.stripTrailingZeros().toPlainString();
    }

    private OilMartDocumentPdfView.Party company() {
        OilMartProperties.Company source = properties.company();
        return new OilMartDocumentPdfView.Party(source.name(), addressLines(source.address()),
                source.phone(), source.fax(), source.email(), source.taxNumber(),
                source.registrationNumber());
    }

    private OilMartDocumentPdfView.Party client(UUID clientId) {
        return clients.findById(clientId)
                .map(client -> new OilMartDocumentPdfView.Party(client.getName(),
                        addressLines(client.getAddress()), client.getPhone(), null,
                        client.getEmail(), null, null))
                .orElseGet(() -> new OilMartDocumentPdfView.Party(null, List.of(), null, null,
                        null, null, null));
    }

    private String accountCode(UUID clientId) {
        return clients.findById(clientId).map(client -> client.getCode()).orElse(null);
    }

    private String salesRep(UUID userId) {
        return users.findById(userId)
                .map(user -> user.displayName() != null ? user.displayName() : user.username())
                .orElse(null);
    }

    private String logoUri() {
        String configured = properties.company().logoPath();
        if (configured == null || configured.isBlank()) {
            return null;
        }
        try {
            Path path = Path.of(configured);
            String mediaType = configured.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
            return "data:%s;base64,%s".formatted(mediaType,
                    Base64.getEncoder().encodeToString(Files.readAllBytes(path)));
        } catch (Exception unreadable) {
            return null;
        }
    }

    private OilMartDocumentPdfView.Bank bank(OilMartBankDetails details) {
        return details == null ? null : new OilMartDocumentPdfView.Bank(details.getAccountName(),
                details.getBankName(), details.getBranch(), details.getAccountNumber(),
                details.getSwiftCode());
    }

    private List<String> addressLines(String address) {
        if (address == null || address.isBlank()) {
            return List.of();
        }
        return Arrays.stream(address.split("\\r?\\n|\\|"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .toList();
    }

    private String joinNonBlank(String separator, String... values) {
        return Arrays.stream(values)
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.joining(separator));
    }

    private Map<UUID, OilMartItem> itemsById() {
        return items.findAll().stream()
                .collect(Collectors.toMap(OilMartItem::getId, Function.identity()));
    }

    static class PdfRenderingFailed extends BusinessException {
        PdfRenderingFailed(String documentNo, Throwable cause) {
            super(HttpStatus.INTERNAL_SERVER_ERROR, "OILMART_PDF_RENDER_FAILED",
                    "Could not render the PDF for %s".formatted(documentNo));
            super.initCause(cause);
        }
    }
}
