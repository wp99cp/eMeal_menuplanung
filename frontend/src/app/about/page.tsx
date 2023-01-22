import { Text } from '@/components/basics/Text';
import { TextLink } from '@/components/basics/TextLink';
import { Title } from '@/components/basics/Title';

export default function AboutPage() {
  return (
    <>
      <Title heading="Lagerküche online planen.">
        Eine gute Lagerküche ist für den Erfolg eines Lagers zentral. Denn
        feines Essen sorgt nicht nur für gute Stimmung im Team, sondern eine
        ausgewogene Ernährung versorgt die Teilnehmer auch mit genügend Power,
        um einen langen Lagertag zu überstehen.
      </Title>

      <Text>
        Doch ein Essensplan für ein ganzes Lager zusammenzustellen, ohne dabei
        die Übersicht über die Einkaufslisten zu verlieren, ist nicht ganz
        einfach. Zum Glück gibt es mittlerweilen Alternativen zur Planung mit
        Stift und Papier: Unsere Software eMeal - Menüplanung ist eine davon.{' '}
        <TextLink href="/app"> Jetzt mit Planen loslegen.</TextLink>
      </Text>
      <Text>
        eMeal - Menüplanung ermöglicht es die Essensplanung für ein Lager oder
        Anlass zu automatisieren. Denn bei eMeal handelt es sich um eine
        Webseite, die dir alle mühsamen Aufgaben, wie das zusammentragen von
        Einkaufslisten abnimmt und dabei erst noch die Zusammenarbeit
        erleichtert.
      </Text>
      <Text>
        eMeal - Menüplanung ermöglicht es die Essensplanung für ein Lager oder
        Anlass zu automatisieren. Denn bei eMeal handelt es sich um eine
        Webseite, die dir alle mühsamen Aufgaben, wie das zusammentragen von
        Einkaufslisten abnimmt und dabei erst noch die Zusammenarbeit
        erleichtert.
      </Text>
      <Text>
        Das Lagerhandbuch wird hierzu in der Cloud gespeichert, somit steht es
        überall und auf allen Geräten zur Verfügung. Natürlich kannst du dein
        Lagerhandbuch vor dem Lager ausdrucken und/oder als PDF herunterladen.
      </Text>
      <Text>
        Eine breite Palette an erprobten Lager-Rezepten ermöglicht es dir binnen
        Minuten einen Wochenplan zu erstellen. Herzlichen Dank an dieser Stelle
        an die Autoren des Kochbuchs «Feine Lagerküche» für die Bereitstellung
        ihrer Rezepte.{' '}
        <TextLink href="https://www.lagerkueche.ch/">
          Kochbuch bestellen!
        </TextLink>
      </Text>
      <Text>
        eMeal unterscheidet dabei zwischen Lagern, Mahlzeiten und Rezepten, vor
        allem die Unterscheidung letzterer scheint auf den ersten Blick etwas
        verwirrend, hat aber bei genauerem Hinschauen einen praktischen Grund:
        Jede Mahlzeit besteht aus verschiedenen Rezepten. So betsteht die
        Mahlzeit “Hörndli & G’hacktes” aus den vier Rezepten “Hörndli und
        G’hacktes”, “Selbstgemachtes Apfelmuss”, “Salat als Beilage” und
        “Französische Salatsauce”. Soll es an einem weiteren Lagertag ebenfalls
        Salat geben, so können die bereits erstellten Rezepte wiederverwendet
        werden. Dies natürlich in beliebiger Kombination, also auch als “Salat
        als Beilage” mit “Italienische Salatsauce”.
      </Text>
      <Text>
        Natürlich garantiert dir eMeal alleine noch keine erfolgreiche
        Lagerplanung, doch sie erleichtert diese enorm. Wenn du du eMeal für
        dein nächstes Lager verwenden möchtest, so kannst du noch heute damit
        loslegen. Von und für Cevianer entwickelt ist die Nutzung für alle
        Cevi-Abteilungen kostenlos.{' '}
        <TextLink href="/app"> Jetzt mit Planen loslegen.</TextLink>
      </Text>
    </>
  );
}
