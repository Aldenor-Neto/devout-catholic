import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/header';
import Accordion from '../components/Accordion';
import catecismo from '../../assets/data/catecismo.json';

interface ItemCIC {
    tipo: string;
    texto: string;
}

const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const SECTION_KEYS = [
    'PRÓLOGO',
    'PARTE 1: A PROFISSÃO DA FÉ',
    'PARTE II: OS SACRAMENTOS DE FÉ',
    'PARTE III: A VIDA DA FÉ',
    'PARTE IV: A ORAÇÃO NA VIDA DA FÉ',
];

export default function CatecismoScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const data: ItemCIC[] = catecismo as ItemCIC[];

    const filteredData = useMemo(() => {
        if (!query.trim()) return data;

        const q = normalize(query);
        const results: ItemCIC[] = [];

        let lastSection: ItemCIC | null = null;
        let lastSub: ItemCIC | null = null;

        data.forEach(item => {
            const tipo = item.tipo.toLowerCase();
            const textoNorm = normalize(item.texto);

            // Guarda a seção principal
            if (tipo === 'titulo' && SECTION_KEYS.includes(item.texto.trim())) {
                lastSection = item;
                lastSub = null;
                return;
            }

            // Guarda o último subtítulo
            if (tipo.includes('sub')) {
                lastSub = item;
                return;
            }

            // Achou ocorrência
            if (textoNorm.includes(q)) {
                if (lastSection && !results.includes(lastSection)) {
                    results.push(lastSection);
                }

                if (lastSub && !results.includes(lastSub)) {
                    results.push(lastSub);
                }

                results.push(item);
            }
        });

        return results;
    }, [query, data]);

    /**
     * Estrutura final:
     * 5 caixas principais (Prólogo + Partes I–IV)
     * Subtítulos = accordion nível 2
     * Texto solto entre eles = texto direto
     */
    const tree = useMemo(() => {
        const sections: any[] = [];
        let currentSection: any = null;
        let currentSub: any = null;

        filteredData.forEach(item => {
            const text = item.texto.trim();
            const tipo = item.tipo.toLowerCase();

            // Detecta as 5 grandes seções
            if (tipo === 'titulo' && SECTION_KEYS.includes(text)) {
                currentSection = { title: text, content: [] };
                sections.push(currentSection);
                currentSub = null;
                return;
            }

            if (!currentSection) return;

            // Subtítulos → accordion nível 2
            if (tipo.includes('sub')) {
                currentSub = { title: text, content: [] };
                currentSection.content.push({ type: 'sub', node: currentSub });
                return;
            }

            // Destaques sem accordion
            if (['capitulo', 'artigo', 'titulo'].includes(tipo)) {
                const node = { type: 'highlight', text };
                if (currentSub) currentSub.content.push(node);
                else currentSection.content.push(node);
                return;
            }

            // Texto comum
            const textNode = { type: 'text', text };
            if (currentSub) currentSub.content.push(textNode);
            else currentSection.content.push(textNode);
        });

        return sections;
    }, [filteredData]);

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.subHeaderButtons}>
                <Text style={styles.link} onPress={() => router.push('/')}>Home</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.screenTitle}>Catecismo da Igreja Católica</Text>

                <TextInput
                    style={styles.search}
                    placeholder="Pesquisar por número ou assunto (ex: liturgia)"
                    placeholderTextColor="#aaa"
                    value={query}
                    onChangeText={setQuery}
                />

                {tree.map((section, i) => (
                    <Accordion key={i} title={section.title}>
                        {section.content.map((item: any, j: number) => {
                            if (item.type === 'sub') {
                                return (
                                    <Accordion key={j} title={item.node.title} level={2}>
                                        {item.node.content.map((c: any, k: number) => (
                                            <RenderContent key={k} node={c} />
                                        ))}
                                    </Accordion>
                                );
                            }
                            return <RenderContent key={j} node={item} />;
                        })}
                    </Accordion>
                ))}
            </ScrollView>
        </View>
    );
}

function RenderContent({ node }: any) {
    if (node.type === 'highlight') {
        return <Text selectable style={styles.highlight}>{node.text}</Text>;
    }

    return <Text selectable style={styles.paragraph}>{node.text}</Text>;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollContainer: { padding: 20 },

    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
    },

    paragraph: {
        fontSize: 16,
        color: '#d1d5db',
        lineHeight: 24,
        marginBottom: 12,
    },

    highlight: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 10,
    },

    search: {
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 8,
        padding: 10,
        color: '#fff',
        marginBottom: 20,
    },

    subHeaderButtons: {
        flexDirection: 'row',
        marginLeft: 10,
        marginBottom: 10,
    },

    link: {
        color: '#fff',
        backgroundColor: '#333',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
});
