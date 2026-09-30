# 6.º In Europa — Encontro Internacional de Inteligência nos Negócios

Site institucional one-page do encontro de 18 de outubro de 2026, no Hotel Lezíria Park, em Vila Franca de Xira.
Realização: Próximo Nível Eventos e Negócios (Gádia Santos).

HTML5 + CSS3 + JavaScript vanilla. Sem framework, sem build step, sem dependências instaladas.

---

## Estrutura

```
index.html                  página principal (13 secções)
politica-privacidade.html   política de privacidade (RGPD)
css/style.css               estilos, tokens em :root
js/main.js                  Lenis, GSAP/ScrollTrigger, nav, scroll spy, separadores
assets/img/                 hero, Lisboa, hotel, retrato, galeria, monograma, favicon, og
robots.txt / sitemap.xml    indexação (apontam para o domínio final)
assets/icons/               ícones dos 5 pilares (extraídos do material oficial)
.nojekyll                   evita o processamento Jekyll no GitHub Pages
```

Bibliotecas via CDN (`jsdelivr`): Lenis 1.1.13 e GSAP 3.12.5 + ScrollTrigger.
Se o CDN falhar, o site continua a funcionar: o reveal passa para transições CSS e o scroll
volta ao comportamento nativo.

---

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Site 6.º In Europa"
git branch -M main
git remote add origin <url-do-repositorio>
git push -u origin main
```

Depois, em **Settings → Pages**, escolher `Deploy from a branch` → `main` → `/ (root)`.
Não é preciso build. Para um domínio próprio, adicionar um ficheiro `CNAME` com o domínio
e atualizar `<link rel="canonical">` e `og:image` no `index.html` para o URL absoluto.

Para pré-visualizar localmente:

```bash
python -m http.server 8899
# abrir http://127.0.0.1:8899
```

---

## A confirmar antes de publicar

| # | O quê | Onde |
|---|---|---|
| 1 | Valores do Passaporte VIP e do lugar de acompanhante | `index.html` — secção Investimento, etiquetas `placeholder-tag` |
| 2 | Formas de pagamento aceites | `index.html` — bloco `.payment` |
| 3 | Nome, cargo, foto e bio dos palestrantes | `index.html` — secção Convidados, cards `.speaker` |
| 4 | E-mail oficial para exercício de direitos RGPD | `politica-privacidade.html` — ponto 1 |
| 5 | ~~Domínio final~~ — definido: `inteligencianosnegocios.com` | — |
| 6 | LinkedIn — o ícone foi retirado a pedido; repor quando houver perfil | `index.html` — rodapé, `.footer__social` |

Cada ponto está marcado no código com um comentário `PLACEHOLDER` ou com a etiqueta
visual `.placeholder-tag` (moldura tracejada dourada), para não passar despercebido.

---

## Como editar o mais comum

**Trocar um valor por um preço real** — substituir
`<span class="placeholder-tag">Valor a confirmar</span>` pelo valor, por exemplo:

```html
<p class="plan__value">1.500 €</p>
```

**Adicionar um palestrante real** — no card `.speaker`, trocar o bloco `.speaker__photo`
por uma fotografia e preencher nome, cargo e bio:

```html
<div class="media speaker__photo"><img src="assets/img/convidados/nome.jpg" alt="Nome do palestrante"></div>
<div class="speaker__info">
  <h3 class="speaker__name">Nome</h3>
  <p class="speaker__role">Cargo · País</p>
  <p class="speaker__bio">Uma ou duas linhas.</p>
</div>
```

Fotografias de convidados em 4:5 (por exemplo 800×1000 px) mantêm a grelha alinhada.

**Legendar as fotos das edições anteriores** — as imagens em `assets/img/galeria/`
estão sem legenda individual porque o material de origem não permite associar cada
fotografia à respetiva data com certeza. As edições estão identificadas em conjunto,
nas etiquetas acima da galeria (Lisboa fev/mar/jul/out/dez 2025 e Salvador fev 2025).
Para legendar uma foto, juntar dentro do `.media`:

```html
<span class="media__caption">Lisboa · Fev 2025</span>
```

**Mudar cores ou tipos de letra** — tudo em `css/style.css`, no bloco `:root`.

---

## Identidade

Retirada do branding oficial e do PDF institucional do cliente:

| Token | Valor | Uso |
|---|---|---|
| `--navy` | `#14237D` | azul institucional |
| `--navy-deep` | `#0B1436` | fundo das secções escuras |
| `--navy-ink` | `#070C1F` | rodapé e menu |
| `--gold` | `#B89946` | filetes, ícones, botões |
| `--gold-light` | `#C9A84C` | destaques sobre fundo escuro |
| `--gold-deep` | `#7A6020` | texto pequeno sobre fundo claro (contraste AA) |

Tipos de letra (Google Fonts, substituições livres das fontes proprietárias do Canva):

- **Playfair Display** — títulos e assinatura editorial (no lugar de *Asangha* / *Catchy Mager*)
- **Space Grotesk** — blocos de destaque e etiquetas (no lugar de *Cy Grotesk*)
- **Raleway** — corpo de texto (já usada no material original)
- **Playfair Display SC** — versaletes

O monograma (`assets/img/monograma.svg`) é a marca oficial — um **"I" sobreposto a um "N"**
em Asangha-ReEx. Os contornos dos dois glifos foram vetorizados a partir do material do
cliente e o encaixe foi validado contra as referências em `referencias-marca/` (98% de
sobreposição). Só a marca é vetor: nenhum ficheiro de fonte proprietária é distribuído
com o site.

---

## Acessibilidade e desempenho

- HTML semântico, um só `h1`, hierarquia de títulos sem saltos
- Contraste WCAG AA verificado em todo o texto
- Navegação por teclado completa, incluindo os separadores da programação (setas, Home, End)
- `prefers-reduced-motion` respeitado: sem smooth scroll, sem parallax, sem reveal
- Imagens com `width`/`height` e `loading="lazy"` fora do primeiro ecrã
- Sem erros de consola; total de imagens ≈ 2 MB
